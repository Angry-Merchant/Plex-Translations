const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

const defaultConfig = {
    defaultOutputLanguage: 'en'
};

function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } else {
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
            return defaultConfig;
        }
    } catch (error) {
        console.error('Error loading config:', error);
        return defaultConfig;
    }
}

function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    } catch (error) {
        console.error('Error saving config:', error);
    }
}

const userPreferences = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translate the previous message or set your output language')
        .addSubcommand(subcommand =>
            subcommand
                .setName('message')
                .setDescription('Translate the previous message'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set your default output language')
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Your preferred output language')
                        .setRequired(true)
                        .addChoices(
                            { name: 'English', value: 'en' },
                            { name: 'Spanish', value: 'es' },
                            { name: 'French', value: 'fr' },
                            { name: 'German', value: 'de' },
                            { name: 'Italian', value: 'it' },
                            { name: 'Portuguese', value: 'pt' },
                            { name: 'Russian', value: 'ru' },
                            { name: 'Japanese', value: 'ja' },
                            { name: 'Korean', value: 'ko' },
                            { name: 'Chinese (Simplified)', value: 'zh-CN' },
                            { name: 'Arabic', value: 'ar' },
                            { name: 'Hindi', value: 'hi' },
                            { name: 'Dutch', value: 'nl' },
                            { name: 'Polish', value: 'pl' },
                            { name: 'Turkish', value: 'tr' },
                            { name: 'Swedish', value: 'sv' },
                            { name: 'Vietnamese', value: 'vi' },
                            { name: 'Thai', value: 'th' },
                            { name: 'Greek', value: 'el' },
                            { name: 'Czech', value: 'cs' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('View your current translation settings')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        const languageNames = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh-CN': 'Chinese (Simplified)',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'nl': 'Dutch',
            'pl': 'Polish',
            'tr': 'Turkish',
            'sv': 'Swedish',
            'vi': 'Vietnamese',
            'th': 'Thai',
            'el': 'Greek',
            'cs': 'Czech'
        };

        if (subcommand === 'set') {
            const language = interaction.options.getString('language');
            userPreferences.set(interaction.user.id, language);

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('✅ Language Preference Updated')
                .setDescription(`Your default output language is now set to **${languageNames[language]}**!\n\nUse \`/translate message\` to translate messages to ${languageNames[language]}.`)
                .setFooter({ text: `Settings saved for ${interaction.user.tag}` })
                .setTimestamp();

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'config') {
            const config = loadConfig();
            const userLang = userPreferences.get(interaction.user.id) || config.defaultOutputLanguage;

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('⚙️ Your Translation Settings')
                .addFields(
                    { 
                        name: '🌐 Output Language', 
                        value: `**${languageNames[userLang]}** (${userLang})`,
                        inline: true
                    },
                    {
                        name: '🔍 Input Language',
                        value: '**Auto-detect** (any language)',
                        inline: true
                    }
                )
                .setDescription(`Use \`/translate set\` to change your output language.\nUse \`/translate message\` to translate messages.`)
                .setFooter({ text: `Settings for ${interaction.user.tag}` })
                .setTimestamp();

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'message') {
            await interaction.deferReply();

            try {
                const messages = await interaction.channel.messages.fetch({ limit: 2 });
                const messagesArray = Array.from(messages.values());
                
                let messageToTranslate = null;
                for (const msg of messagesArray) {
                    if (msg.id !== interaction.id && !msg.author.bot) {
                        messageToTranslate = msg;
                        break;
                    }
                }

                if (!messageToTranslate || !messageToTranslate.content || messageToTranslate.content.trim() === '') {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle('❌ No Message Found')
                        .setDescription('Could not find a message to translate. Make sure there is a message above your command.')
                        .setFooter({ text: 'Translation Error' })
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [errorEmbed] });
                }

                const config = loadConfig();
                const targetLang = userPreferences.get(interaction.user.id) || config.defaultOutputLanguage;

                const translate = require('translate-google');
                
                const translatedText = await translate(messageToTranslate.content, {
                    from: 'auto',
                    to: targetLang
                });

                const embed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('🌐 Auto-Translation')
                    .setDescription(`🔍 **Auto-detecting language** → Translating to **${languageNames[targetLang]}**`)
                    .addFields(
                        {
                            name: '💬 Original Message',
                            value: `👤 **Author:** ${messageToTranslate.author.tag}\n🔗 **[Jump to Message](${messageToTranslate.url})**`,
                            inline: false
                        },
                        { 
                            name: '📝 Original Text', 
                            value: messageToTranslate.content.length > 1024 ? messageToTranslate.content.substring(0, 1021) + '...' : messageToTranslate.content,
                            inline: false
                        },
                        { 
                            name: `✨ Translated to ${languageNames[targetLang]}`, 
                            value: translatedText.length > 1024 ? translatedText.substring(0, 1021) + '...' : translatedText,
                            inline: false
                        }
                    )
                    .setFooter({ text: `Requested by ${interaction.user.tag}` })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error('Translation error:', error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('❌ Translation Error')
                    .setDescription('Failed to translate the message. This could be due to:\n\n• Network connection issues\n• Invalid or unsupported text\n• Translation service temporarily unavailable\n\nPlease try again in a moment.')
                    .setFooter({ text: 'Translation Service Error' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [errorEmbed] });
            }
        }
    }
};
