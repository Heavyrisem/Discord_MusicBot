import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';

export async function initRegisterCommands(CLIENT_ID: string) {
    dotenv.config();

    const TOKEN = process.env.NODE_ENV === 'dev' ? process.env.TEST_TOKEN : process.env.TOKEN;
    const commands: any[] = [];

    const rest = new REST({ version: '9' }).setToken(TOKEN);
    const GUILD_ID = '269848346422804501';
    try {
        console.log('Started refreshing application (/) commands.');

        commands.push(
            new SlashCommandBuilder().setName(createCommandName('핑')).setDescription('디스코드 봇의 핑을 알려줍니다.'),
        );
        commands.push(
            new SlashCommandBuilder().setName(createCommandName('ping')).setDescription('디스코드 봇의 핑을 알려줍니다.'),
        );
        commands.push(
            new SlashCommandBuilder()
                .setName(createCommandName('노래'))
                .setDescription('재생 가능한 노래들을 검색합니다.')
                .addStringOption((option) =>
                    option.setName(createCommandName('keyword')).setDescription('검색어').setRequired(true),
                ),
        );
        commands.push(
            new SlashCommandBuilder()
                .setName(createCommandName('p'))
                .setDescription('재생 가능한 노래들을 검색합니다.')
                .addStringOption((option) =>
                    option.setName(createCommandName('keyword')).setDescription('검색어').setRequired(true),
                ),
        );
        commands.push(new SlashCommandBuilder().setName(createCommandName('큐')).setDescription('재생 대기열을 표시합니다.'));
        commands.push(
            new SlashCommandBuilder()
                .setName(createCommandName('스킵'))
                .setDescription('재생 중인 음악을 스킵합니다.')
                .addIntegerOption((option) =>
                    option.setName(createCommandName('n')).setDescription('스킵할 음악의 번호').setRequired(false),
                ),
        );
        commands.push(
            new SlashCommandBuilder()
                .setName(createCommandName('s'))
                .setDescription('재생 중인 음악을 스킵합니다.')
                .addIntegerOption((option) =>
                    option.setName(createCommandName('n')).setDescription('스킵할 음악의 번호').setRequired(false),
                ),
        );
        commands.push(
            new SlashCommandBuilder()
                .setName(createCommandName('볼륨'))
                .setDescription('재생 볼륨을 설정합니다.')
                .addIntegerOption((option) =>
                    option.setName(createCommandName('volume')).setDescription('볼륨').setRequired(true),
                ),
        );
        commands.push(new SlashCommandBuilder().setName(createCommandName('정지')).setDescription('재생을 종료합니다.'));
        commands.push(
            new SlashCommandBuilder().setName(createCommandName('업타임')).setDescription('봇의 가동 시간을 보여줍니다.'),
        );
        // commands.push(new SlashCommandBuilder().setName(createCommandName("참가")).setDescription("음성 채널에 참가합니다."));

        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

function createCommandName(name: string): string {
    const tmp = process.env.NODE_ENV === 'dev' ? '테스트_' + name : name;
    console.log(tmp, process.env.NODE_ENV);
    return tmp;
}
