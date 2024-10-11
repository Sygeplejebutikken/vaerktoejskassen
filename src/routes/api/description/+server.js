if (process.env.NODE_ENV !== 'production') {
    await import('dotenv').then(dotenv => dotenv.config());
}

import { OpenAI } from 'openai';
const openai = new OpenAI();

export async function POST({ request }) {
    const { description } = await request.json();
    
    console.log('Modtager beskrivelse:', description);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",  // Skift modelnavn, hvis nødvendigt
            messages: [
                { role: "system", content: `Omskriv denne produktbeskrivelse. Lav tre korte sætninger, som hver fremhæver en vigtig pointe om dette produkt. Hvis beskrivelsen indeholder skostørrelser, så lav en fjerde sætning der nævner disse. Her er formatet:
{{Pointe 1}}.

{{Pointe 2}}

{{Pointe 3}}

Fås i størrelser fra {{xx}} til {{xx}} 
` },
                { role: "user", content: description }
            ]
        });

        const aiMessage = response.choices[0].message.content;
        
        console.log('Svar fra OpenAI:', aiMessage);

        return new Response(JSON.stringify({ reply: aiMessage }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Fejl i forespørgsel til OpenAI:', error);
        return new Response(JSON.stringify({ error: "Noget gik galt med OpenAI API'et" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
