import { Client, Intents } from 'discord.js';
import { generateDependencyReport } from '@discordjs/voice';

import MusicPlayer from './commands/music';

import { TOKEN, VERSION } from './Config.json';
import prettyms from 'pretty-ms';

console.log(generateDependencyReport());

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const MusicManager: { [index: string]: MusicPlayer } = {};

client.on('ready', () => {
  let Flipflop = 0;
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
    client.guilds.cache.forEach((Guild) => (MusicManager[Guild.id] = new MusicPlayer()));

    setInterval(() => {
      if (!client.user) return console.log('ERR');
      switch (Flipflop) {
        case 0:
          client.user.setActivity(`v${VERSION}`);
          Flipflop++;
          break;
        case 1:
          client.user.setActivity(`${prettyms(client.uptime as number)} 가동`);
          Flipflop = 0;
          break;
      }
    }, 5000);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (!MusicManager[interaction.guildId]) MusicManager[interaction.guildId] = new MusicPlayer();

  const GuildMusicPlayer = MusicManager[interaction.guildId];

  const InteractionData: { videoId?: string; id?: string } = JSON.parse(interaction.customId);
  if (InteractionData.videoId && InteractionData.id) {
    // console.log(InteractionData.id, interaction.user.id)
    if (InteractionData.id === interaction.user.id) {
      interaction.update({ content: '`선택이 완료되었습니다.`', components: [] });
      GuildMusicPlayer.AddMusic(interaction, InteractionData.videoId).catch((err) => interaction.reply(`\`\`${err}\`\``));
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (!MusicManager[interaction.guildId]) MusicManager[interaction.guildId] = new MusicPlayer();
  const GuildMusicPlayer = MusicManager[interaction.guildId];

  try {
    switch (interaction.commandName) {
      case '핑': {
        await interaction.reply(`\`${client.ws.ping} ms\``);

        break;
      }
      case '노래': {
        const Keyword = interaction.options.get('keyword');
        if (!Keyword) return await interaction.reply('키워드가 없습니다.');

        const youtube_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        const URL = (Keyword.value as string).match(youtube_regex);
        // const list_regex = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
        // let URL_list = (Keyword.value as string).match(list_regex);

        if (URL)
          await GuildMusicPlayer.AddMusic(interaction, URL[URL.length - 1]).then(() =>
            interaction.reply('`URL에서 음악을 불러왔습니다.`'),
          );
        else await GuildMusicPlayer.SendUserSelection(interaction);

        break;
      }
      case '큐': {
        if (GuildMusicPlayer.Queue.length)
          interaction.reply(
            `\`\`\`swift\n${GuildMusicPlayer.Queue.map((V, i) => `${i + 1}: ${V.title.slice(0, 50)} (${V.author})`).join(
              '\n',
            )}\`\`\``,
          );
        else await interaction.reply('`큐가 비었습니다.`');

        break;
      }
      case '스킵': {
        await GuildMusicPlayer.Skip(interaction);

        break;
      }
      case '정지': {
        await GuildMusicPlayer.Stop(interaction);

        break;
      }
      case '볼륨': {
        await GuildMusicPlayer.Volume(interaction);

        break;
      }
    }
  } catch (err) {
    interaction.reply(`\`\`${err}\`\``);
  }
});

client.login(TOKEN);
