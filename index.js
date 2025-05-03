import dotenv from 'dotenv';
import cron from 'node-cron';
import { Client, GatewayIntentBits } from 'discord.js';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

async function getMotivationalQuote() {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'command-r-plus',
            prompt: 'Give me a motivational quote.',
            max_tokens: 50,
            temperature: 0.8
        })
    });
    const data = await response.json();
    if (data.text) {
        return data.text.trim();
    } else {
        throw new Error('Failed to get quote: ' + JSON.stringify(data));
    }
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
  
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    if(!channel) {
        console.error('Channel not found');
        return;
    }
    
    try {
        const quote = await getMotivationalQuote();
        channel.send(`🌞 Morning Quote:\n${quote}`);
    } catch (err) {
        console.error('Error sending immediate quote:', err);
    }

    cron.schedule('0 8 * * *', async () => {
        try {
            const quote = await getMotivationalQuote();
            await channel.send(`🌅 Good Morning! Here's your quote:\n${quote}`);
        } catch (err) {
            console.error('Error sending morning quote:', err);
        }
    });

    cron.schedule('0 19 * * *', async () => {
        try {
            const quote = await getMotivationalQuote();
            await channel.send(`🌙 Evening Boost:\n${quote}`);
        } catch (err) {
            console.error('Error sending evening quote:', err);
        }
    });
  });

client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('Bot is online!'))
    .catch(err => console.error('Failed to login:', err));