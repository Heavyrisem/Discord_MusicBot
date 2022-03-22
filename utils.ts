import { CacheType, CommandInteraction, Interaction, StageChannel, VoiceChannel } from 'discord.js';

export function GetVoiceChannel(interaction: Interaction<CacheType>, id: string): VoiceChannel | StageChannel | null {
    if (!interaction.guildId) return null;

    const guild = interaction.client.guilds.cache.get(interaction.guildId);
    if (guild && interaction.member) {
        const member = guild.members.cache.get(id);
        if (member) {
            const voiceChannel = member.voice.channel;

            return voiceChannel;
        }
    }
    return null;
}
