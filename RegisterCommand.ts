import { REST } from '@discordjs/rest'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Routes } from 'discord-api-types/v9'
import { TOKEN, VERSION } from './Config.json';
const [CLIENT_ID, GUILD_ID] = ["619527364090658817", "269848346422804501"];
const commands: any[] = [];

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    commands.push(new SlashCommandBuilder().setName("핑").setDescription("디스코드 봇의 핑을 알려줍니다."));
    commands.push(new SlashCommandBuilder().setName("노래").setDescription("재생 가능한 노래들을 검색합니다.").addStringOption(option => option.setName("keyword").setDescription("검색어").setRequired(true)));
    commands.push(new SlashCommandBuilder().setName("큐").setDescription("재생 대기열을 표시합니다."));
    commands.push(new SlashCommandBuilder().setName("스킵").setDescription("재생 중인 음악을 스킵합니다."));
    commands.push(new SlashCommandBuilder().setName("볼륨").setDescription("재생 볼륨을 설정합니다.").addIntegerOption(option => option.setName("volume").setDescription("볼륨").setRequired(true)));
    commands.push(new SlashCommandBuilder().setName("정지").setDescription("재생을 종료합니다."));


    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();