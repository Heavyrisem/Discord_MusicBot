import ytdl from "ytdl-core";
import yts from 'yt-search';
import fs from 'fs';
import { CacheType, Interaction, MessageActionRow, MessageButton } from "discord.js";
import { GetVoiceChannel } from "../utils";
import { AudioPlayer, AudioPlayerState, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, getVoiceConnection, getVoiceConnections, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";


interface Music_T {
    id: string
    title: string
    duration: string
    author: string
}
class MusicPlayer {
    Queue: Music_T[] = [];
    Player: AudioPlayer;
    PlayOptions = {
        Volume: 100
    };
    Resource: AudioResource<null> | undefined;

    constructor() {
        this.Player = createAudioPlayer();
        this.Resource = undefined;
    }

    Search(Keyword: string): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            const SearchResult = await (await yts(Keyword)).videos;
            
            return resolve(SearchResult.map((V, index) => `${index+1}: ${V.title} (${V.duration}) - ${V.author}`))
        })
    }

    SendUserSelection(interaction: Interaction<CacheType>): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!interaction.isCommand()) return reject("SendUserSelection() > Something Went Wrong");

            const Keyword = interaction.options.get('keyword');
            if (!Keyword) return interaction.reply("키워드가 없습니다.");
            
            // const SearchResult = await this.Search(Keyword.value as string);
            
            const SearchResult = await (await yts(Keyword.value as string)).videos.slice(0, 5);

            const Selection = SearchResult.map((V, i) => new MessageActionRow().addComponents(new MessageButton().setStyle("PRIMARY").setLabel(`${i+1}: ${V.title.slice(0, 50)} (${V.timestamp})`).setCustomId(JSON.stringify({videoId: V.videoId, id: interaction.user.id}))))
            const MusicSelectMessage = await interaction.reply({ content: `\`노래를 선택해 주세요\``, components: Selection, fetchReply: true });

            setTimeout(async () => {
                // console.log("Delete message", MusicSelectMessage.type);
                if (MusicSelectMessage.type == "APPLICATION_COMMAND") {
                    const ExpiredMessage = await MusicSelectMessage.fetch();
                    // console.log(ExpiredMessage.createdTimestamp, ExpiredMessage.editedTimestamp)
                    if (!ExpiredMessage.deleted&&ExpiredMessage.deletable&&(ExpiredMessage.createdTimestamp===ExpiredMessage.editedTimestamp||!ExpiredMessage.editedTimestamp)) {
                        ExpiredMessage.edit({ content: "`선택 시간이 만료되었습니다.`", components: [] })//.catch(err => console.log("Already Deleted Message"));
                    }
                }
            }, 1000 * 10);
            return resolve();
        })
    }

    AddMusic(interaction: Interaction<CacheType>, id: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // if (!interaction.isButton()) return reject("AddMusic() > Something Went Wrong");
    
            console.log("Adding music", id);
            const UserVoiceChannel = GetVoiceChannel(interaction, interaction.user.id);
            if (!UserVoiceChannel) return reject("AddMusic() > 먼저 음성 채널에 참여해 주세요");

            const MusicDetail = await ytdl.getBasicInfo(id);

            this.Queue.push({
                id: MusicDetail.videoDetails.videoId,
                title: MusicDetail.videoDetails.title,
                duration: MusicDetail.timestamp,
                author: interaction.user.username
            });
            
            if (this.Player.state.status != AudioPlayerStatus.Playing && !getVoiceConnection(interaction.guildId)) {
                this.PlayMusic(interaction);
            } else {
                console.log(this.Player.state.status, !getVoiceConnection(interaction.guildId));
                (interaction.channel)&& interaction.channel.send(`\`${MusicDetail.videoDetails.title} 를 재생목록에 추가했어요.\``);
            }
            return resolve();
        })
    }

    async PlayMusic(interaction: Interaction<CacheType>) {
        try {
            if (!this.Queue.length) return;
            const Music = this.Queue[0];
            const MusicStream = await ytdl(Music.id, {filter: 'audioonly', highWaterMark: 1<<10});
            // MusicStream.pipe(fs.createWriteStream("./test.mp3"));

            // const Read = fs.createReadStream("./test.mp3");

            const Connection = await this.JoinVoiceChannel(interaction);

            this.Resource = createAudioResource(MusicStream, {inlineVolume: true});
            if (this.Resource.volume) this.Resource.volume.setVolume(this.PlayOptions.Volume / 1000);
            else console.log("no vol");

            this.Player.play(this.Resource);
            Connection.subscribe(this.Player);
            
            this.Player.once(AudioPlayerStatus.Playing, () => {
                if (interaction.channel) {
                    interaction.channel.send(`\`\`${Music.title} 을(를) 재생해요 🎵\`\``);
                }
            });
    
            this.Player.once(AudioPlayerStatus.Idle, (oldState: AudioPlayerState, newState: AudioPlayerState) => {
                // console.log("old", oldState.status, "new", newState.status);
                if (newState.status === AudioPlayerStatus.Idle) {this.Queue.shift(); this.PlayMusic(interaction);}
            });

            this.Player.once("error", (error) => {
                console.log("Player Error", error);
            })
            

        } catch (err) {
            console.log("PlayMusic() >", err);
            (interaction.channel)&& interaction.channel.send(`\`\`PlayMusic() > ${err}\`\``);
        }
    }

    async Skip(interaction: Interaction<CacheType>): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!interaction.isCommand()) return reject("Skip() > Something Went Wrong");

            if (!this.Queue.length) {
                interaction.reply("``큐가 비었습니다.``");
                return resolve();
            }

            const n = interaction.options.getInteger("n");
            if (n != null) {
                if (n > this.Queue.length || n <= 1) return reject(`잘못된 범위 입니다.`);
                interaction.reply(`\`\`${this.Queue.splice(n-1, 1)[0].title} 를 재생목록에서 제거했어요.\`\``);
                return resolve();
            }

            if (this.Player.state.status === AudioPlayerStatus.Playing) {
                this.Player.stop(true);
            } else this.Queue.shift();
            interaction.reply("`음악을 스킵했어요`");
            return resolve();
        });
    }

    Stop(interaction: Interaction<CacheType>): Promise<void> {
        return new Promise(async (resolve, reject) => {

            if (this.Player.state.status === AudioPlayerStatus.Playing) {
                this.Queue = [];
                this.Player.stop(true);
                if (interaction.isCommand()) interaction.reply("`음악을 정지했어요`");
                else (interaction.channel)&& interaction.channel.send("`음악을 정지했어요`");
            } else {
                if(interaction.isCommand()) interaction.reply("`음악을 재생 중이 아닙니다.`");
                else (interaction.channel)&& interaction.channel.send("`음악을 재생 중이 아닙니다.`");
            }
            return resolve();
        })
    }

    Volume(interaction: Interaction<CacheType>): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!interaction.isCommand()) return reject("Volume() > Something Went Wrong");

            if (interaction.options.getInteger("volume", true) == null) return reject("Volume() > 볼륨을 입력해 주세요");
            if (interaction.options.getInteger("volume", true) < 0) return reject("Volume() > 볼륨은 음수로 설정할 수 없습니다.");

            this.PlayOptions.Volume = interaction.options.getInteger("volume", true);

            if (this.Player.state.status === AudioPlayerStatus.Playing && this.Resource && this.Resource.volume) {
                this.Resource.volume.setVolume(this.PlayOptions.Volume / 1000);
            }
            interaction.reply(`\`볼륨을 ${this.PlayOptions.Volume}% 로 설정했어요.\``);
            return resolve();
        })
    }

    JoinVoiceChannel(interaction: Interaction<CacheType>): Promise<VoiceConnection> {
        return new Promise(async (resolve, reject) => {

            // console.log(interaction.client.user);
            if (!interaction.client.user) return reject("JoinVoiceChannel() > Something Went Wrong");

            // const ClientVoiceChannel = GetVoiceChannel(interaction, interaction.client.user.id);
            const UserVoiceChannel = GetVoiceChannel(interaction, interaction.user.id);
            if (!UserVoiceChannel) return reject("JoinVoiceChannel() > 먼저 음성 채널에 참여해 주세요");

            const CurrentVoiceChannel = getVoiceConnection(interaction.guildId);

            if (CurrentVoiceChannel) return resolve(CurrentVoiceChannel);
            const Connection = joinVoiceChannel({
                channelId: UserVoiceChannel.id,
                guildId: UserVoiceChannel.guild.id,
                adapterCreator: UserVoiceChannel.guild.voiceAdapterCreator
            });
            

            // this.Connection.once(VoiceConnectionStatus.Disconnected, (oldState, newState) => {
            //     console.log("disconnected from voice channel");
            //     this.Connection = undefined;
            //     if (this.Player.state.status === AudioPlayerStatus.Playing) this.Stop(interaction);
            // })
            // Connection.on("stateChange", (oldState, newState) => {
                // console.log("StateChange", oldState.status, newState.status)
                // if (newState.status === VoiceConnectionStatus.Destroyed) {
                    // if (getVoiceConnection(interaction.guildId)) return console.log("Not Disconnected");
                    // console.log("Disconnected from voice channel");
                    // Connection.removeAllListeners();
                    // Connection.destroy();
                // }
            // });
            return resolve(Connection);
        })
    }
}

export default MusicPlayer;
// (async () => {

    

//     // console.log(await (await yts('https://www.youtube.com/watch?v=xarC5jAiO7w&list=RDxarC5jAiO7w')).all)

// })()

// (async () => {
//     const result = await ytdl("https://www.youtube.com/watch?v=mQcQ1rgwDoQ&list=RDmQcQ1rgwDoQ&index=1", {filter: 'audioonly'});

//     result.pipe(fs.createWriteStream('m.mp3'));

//     let downloadedsize = 0;

//     result.on("data", (chunk) => {
//         downloadedsize += (chunk as Buffer).byteLength
//         // console.log(downloadedsize/1000, "KB");
//     })
//     result.on("end", () => {
//         console.log(downloadedsize/1000, "KB");
//         console.log("END");
//     })
// });