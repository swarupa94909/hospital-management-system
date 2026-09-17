const express = require("express");
const router = express.Router();

const ai = require("../ai/geminiClient");
const tools = require("../ai/tools");
const toolHandlers = require("../ai/toolHandlers");
const systemPrompt = require("../ai/systemPrompt");
const authenticatePatient = require("../middleware/authenticatePatient");

/**
 * POST /api/chat
 *
 * Authenticated patient chatbot.
 */
router.post("/", authenticatePatient, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Message is required."
            });
        }

        const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

        // --------------------------------------------------
        // STEP 1: Send patient's message to Gemini
        // --------------------------------------------------
        const response = await ai.models.generateContent({
            model: model,

            contents: message,

            config: {
                systemInstruction: systemPrompt,

                tools: [
                    {
                        functionDeclarations: tools
                    }
                ]
            }
        });

        // --------------------------------------------------
        // STEP 2: Check whether Gemini wants to call a tool
        // --------------------------------------------------
        if (response.functionCalls && response.functionCalls.length > 0) {

            const functionCall = response.functionCalls[0];

            console.log("Gemini requested tool:", functionCall.name);

            const handler = toolHandlers[functionCall.name];

            if (!handler) {
                return res.status(500).json({
                    error: `Unknown tool: ${functionCall.name}`
                });
            }

            // --------------------------------------------------
            // STEP 3: Execute hospital tool
            // --------------------------------------------------
            // Patient identity comes from JWT authentication.
            // Gemini does NOT control patient ID.
            const toolResult = await handler(req.patient);

            console.log("Tool result:", toolResult);

            // --------------------------------------------------
            // STEP 4: Send Gemini's ORIGINAL model content back
            // --------------------------------------------------
            //
            // IMPORTANT:
            // Do NOT manually create:
            //
            // {
            //     functionCall: functionCall
            // }
            //
            // because that removes Gemini's thoughtSignature.
            //
            // response.candidates[0].content contains the
            // original functionCall part INCLUDING its
            // thoughtSignature.
            //
            const modelContent = response.candidates[0].content;

            const finalResponse = await ai.models.generateContent({
                model: model,

                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: message
                            }
                        ]
                    },

                    // Preserve Gemini's ORIGINAL response.
                    // This keeps the thoughtSignature.
                    modelContent,

                    // Send the hospital tool result.
                    {
                        role: "user",
                        parts: [
                            {
                                functionResponse: {
                                    name: functionCall.name,
                                    response: {
                                        result: toolResult
                                    }
                                }
                            }
                        ]
                    }
                ],

                config: {
                    systemInstruction: systemPrompt,

                    tools: [
                        {
                            functionDeclarations: tools
                        }
                    ]
                }
            });

            return res.json({
                success: true,
                reply: finalResponse.text
            });
        }

        // --------------------------------------------------
        // Gemini answered without using a hospital tool
        // --------------------------------------------------
        return res.json({
            success: true,
            reply: response.text
        });

    } catch (error) {

        console.error("Chatbot error:", error);

        return res.status(500).json({
            error: "Unable to process your request.",
            details: error.message
        });
    }
});

module.exports = router;
