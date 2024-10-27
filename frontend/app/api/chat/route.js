import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Get the request body
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    /*
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: 'Create a 1-minute guided visualization script based on a user\'s description of their worry. The script should aim to calm the user and depict a scenario where they succeed, incorporating ellipses and breaks for natural, soothing pauses.\n\n# Steps\n\n1. **Understand the User\'s Worry**: Carefully read the user\'s description to grasp their specific concern.\n2. **Identify Key Themes**: Recognize the underlying themes or emotions in the worry description.\n3. **Add Deep Breaths to Beginning and End**: Guide the user to first close their eyes and take deep breaths in and out. End the visualization with the user taking deep breaths. \n4. **Craft a Positive Scenario**: Develop a visualization scenario where the user successfully overcomes their concern.\n4. **Incorporate Calming Elements**: Utilize calming imagery, language, and a soothing tone throughout.\n5. **Add Pauses**: Integrate ellipses "..." and natural breaks to help create a rhythm that aids relaxation.\n\n# Output Format\n\n- A single paragraph script with soothing language.\n- Use ellipses "..." strategically to indicate pauses.\n- Ensure the scenario remains between 150-200 words to fit within a 1-minute reading time.\n\n# Examples\n\n### Example 1\n\n**Input**: "I am worried about my upcoming job interview. What if I don\'t perform well?"\n\n**Output**: \n"As you sit comfortably... gently close your eyes... take a deep breath in... and slowly release it... Picture yourself on the day of the interview... You walk confidently into the room... each step filled with assurance... You see the interviewer\'s friendly smile... You feel calm and collected... as you answer each question with clarity and ease... With each word, you grow more assured... and the interview progresses smoothly... As it ends, you feel a sense of accomplishment and pride... knowing you have given your best... Breathe in deeply again... and let the positive feelings linger... "\n\n### Example 2\n\n**Input**: "I\'m anxious about starting my own business and whether it will be successful."\n\n**Output**: \n"As you sit comfortably... gently close your eyes... take a deep breath in... and slowly release it... Imagine yourself on a sunny morning... sitting at your desk in your new office... You look around, taking in the sense of achievement... as your business begins to flourish... Each client interaction is positive and rewarding... You see satisfied customers leaving with smiles... and positive feedback pouring in... Your hard work and dedication pay off... and your business thrives beyond expectations... Feel the warmth of success enveloping you... a testament to your courage and vision... Give yourself a moment to savor this success... before returning to the present with confidence... "\n\n# Notes\n\n- Maintain an empathetic and gentle tone throughout the visualization.\n- Ensure scenarios are relatable and directly address the user\'s specific worry.\n- Tailor the positive outcome to align with realistic aspects of success related to their concern.',
            },
          ],
        },
        { role: "user", content: query },
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: "text",
      },
    });

    const first_script = response.choices[0].message.content;
    */
    const first_script =
      "This is the first sentence ... This is the second sentence... This is the third sentence";

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: first_script,
    });

    const audioBuffer = await mp3.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
