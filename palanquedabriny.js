// JOAO PIMENTA CODE
/*
const Discord = require('discord.js');
const Youtube = require('simple-youtube-api');
const Ytdl = require('ytdl-core');
const {TOKEN_DISCORD, TOKEN_GOOGLE } = require('./configs.json');

const youtube = new Youtube(TOKEN_GOOGLE);
const app = new Discord.Client();

const prefixoComando = "-";

const servidores = {};

// let estouPronto = false; SUBSTITUIDO POR 'emCanalDeVoz'

// To-do: Entender por que o !leave está quebrando
//        imprimir nome das músicas com comando !queue
// Para video: 
//        Implementar como lidar com multiplos servidores
//        Implementar !queue
//        Implementar como lidar com permissões
//        Implementar

app.on('ready', () => {
    console.log('Estou conectado!');
});

app.on('message', async (msg) => {
    // !join = Bot se junta ao canal de voz
    if (msg.content === `${prefixoComando}join`){
        if (msg.member.voiceChannel){           

            servidores[msg.guild.id] = [];

            console.log(`Novo servidor: ${msg.guild.name}\nChave criada: ${msg.guild.id}\nNúmero atual de Servidores conectados: ${Object.keys(servidores).length}\n`);
            msg.member.voiceChannel.join();
        }
        else {
            msg.channel.send('Você precisa estar conectado a um Canal de Voz!');
        }
    }

    // !leave = Bot sai do canal de voz
    else if (msg.content === `${prefixoComando}leave`){
        if (msg.member.voiceChannel){
            msg.member.voiceChannel.leave();
            delete servidores[msg.guild.id];
            console.log(`Servidor saindo!\nNome do servidor: ${msg.guild.name}\n`);
        }
        else {
            msg.channel.send('Você precisa estar conectado a um Canal de Voz!');
        }
    }

    // !play [link] = Bot toca músicas
    else if (msg.content.startsWith(`${prefixoComando}play `)){
        if (msg.guild.id in servidores){ // se o servidor (guilda) está presente no map, então estou num canal de voz
            let oQueTocar = msg.content.replace(`${prefixoComando}play `,'');
            console.log(`Servidor ${msg.guild.name.toUpperCase()} insere comando PLAY usando: ${oQueTocar}.\n`);
            try { // tenta encontrar música por link
                let video = await youtube.getVideo(oQueTocar);
                msg.channel.send(`O video foi encontrado!: ${video.title}`);
                servidores[msg.guild.id].push(oQueTocar);
                if (servidores[msg.guild.id].length === 1) {
                    tocarMusica(msg);
                    console.log(`Música inserida!\nNome do servidor: ${msg.guild.name}\nFila atual: ${servidores[msg.guild.id]}\n`);
                }
            } catch (error) {
                try { // tenta encontrar música por pesquisa
                    let videosPesquisados = await youtube.searchVideos(oQueTocar, 5);
                    let videoEncontrado;
                    for (let i in videosPesquisados){
                        videoEncontrado = await youtube.getVideoByID(videosPesquisados[i].id);
                        msg.channel.send(`${i}: ${videoEncontrado.title}`);
                    }
                    msg.channel.send({embed: {
                        color: 0xC4FF90,
                        description: 'Escolha uma música de 0 a 4, clicando nas reações!'
                    }}).then( async (embedMessage) => {
                        await embedMessage.react('0️⃣');
                        await embedMessage.react('1️⃣');
                        await embedMessage.react('2️⃣');
                        await embedMessage.react('3️⃣');
                        await embedMessage.react('4️⃣');

                        const filter = (reaction, user) => {
                            return ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣'].includes(reaction.emoji.name)
                                && user.id === msg.author.id;
                        }

                        let collector = embedMessage.createReactionCollector(filter, {time: 20000});
                        collector.on('collect', async (reaction, rectionCollector) => {
                            if (reaction.emoji.name === '0️⃣'){
                                msg.channel.send('Reagiu com 0️⃣');
                                videoEncontrado = await youtube.getVideoByID(videosPesquisados[0].id);
                                servidores[msg.guild.id].push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);
                            }
                            else if (reaction.emoji.name === '1️⃣'){
                                msg.channel.send('Reagiu com 1️⃣');
                                videoEncontrado = await youtube.getVideoByID(videosPesquisados[1].id);
                                servidores[msg.guild.id].push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);
                            }
                            else if (reaction.emoji.name === '2️⃣'){
                                msg.channel.send('Reagiu com 2️⃣');
                                videoEncontrado = await youtube.getVideoByID(videosPesquisados[2].id);
                                servidores[msg.guild.id].push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);
                            }
                            else if (reaction.emoji.name === '3️⃣'){
                                msg.channel.send('Reagiu com 3️⃣');
                                videoEncontrado = await youtube.getVideoByID(videosPesquisados[3].id);
                                servidores[msg.guild.id].push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);
                            }
                            else if (reaction.emoji.name === '4️⃣'){
                                msg.channel.send('Reagiu com 4️⃣');
                                videoEncontrado = await youtube.getVideoByID(videosPesquisados[4].id);
                                servidores[msg.guild.id].push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);
                            }
                            if (servidores[msg.guild.id].length === 1) {
                                tocarMusica(msg);
                                console.log(`Música inserida!\nNome do servidor: ${msg.guild.name}\nFila atual: ${servidores[msg.guild.id]}\n`);
                            }
                        });
                    });
                } catch (error2) { // pesquisa não retornou nada
                    msg.channel.send('Nenhum vídeo foi encontrado!');
                }
            }
        }
    }

    // !pause = Bot pausa a música
    if (msg.content === `${prefixoComando}pause`){
        if (msg.member.voiceChannel){
            if( (msg.guild.id) in servidores){
                if (msg.member.voiceChannel.connection.dispatcher){
                    if (!msg.member.voiceChannel.connection.dispatcher.paused){
                        msg.member.voiceChannel.connection.dispatcher.pause();
                    } 
                    else {
                        msg.channel.send('Eu já estou pausado!');
                    }
                }
                else {
                    msg.channel.send('Eu nem estou tocando nada...');
                }
            }
            else {
                msg.channel.send('Não estou em um Canal de Voz!');
            }
        }
        else {
            msg.channel.send('Você precisa estar conectado a um Canal de Voz!');
        }

    }

    // !resume = Bot retoma a música
    if (msg.content === `${prefixoComando}resume`){
        if (msg.member.voiceChannel){
            if (msg.member.voiceChannel.connection.dispatcher){
                if (msg.member.voiceChannel.connection.dispatcher.paused){
                    msg.member.voiceChannel.connection.dispatcher.resume();
                } 
                else {
                    msg.channel.send('Eu não estou pausado!');
                }
            }
            else {
                msg.channel.send('Eu nem estou tocando nada...');
            }
        }
        else {
            msg.channel.send('Você precisa estar conectado a um Canal de Voz!');
        }
    }

    // !end = Bot para a música e limpa a fila
    else if (msg.content === `${prefixoComando}end`){
        if (msg.member.voiceChannel){
            if (msg.member.voiceChannel.connection.dispatcher){
                msg.member.voiceChannel.connection.dispatcher.end();
                while (servidores[msg.guild.id].length > 0){
                    servidores[msg.guild.id].shift();
                }
            }
            else {
                msg.channel.send('Não estou tocando nada!');
            }
        }
        else {
            msg.channel.send('Você precisa estar conectado a um Canal de Voz!');
        }
    }

    // !skip = Bot toca a próxima música da fila
    else if (msg.content === `${prefixoComando}skip`){
        if (msg.member.voiceChannel){
            if(msg.member.hasPermission('ADMINISTRATOR')){
                if (msg.member.voiceChannel.connection.dispatcher) {
                    if (servidores[msg.guild.id].length > 1){
                        msg.member.voiceChannel.connection.dispatcher.end();
                    }
                    else {
                        msg.channel.send('Não existem mais músicas a serem tocadas!');    
                    }
                }
                else {
                    msg.channel.send('Não estou tocando nada!');
                }
            }
            else {
                msg.channel.send('Você não tem as permissões necessárias!');
            }
        }
        else {
            msg.channel.send('Você precisa estar conectado a um Canal de Voz!');
        }
    }

});

function tocarMusica(msg){
    msg.member.voiceChannel.connection.playStream(Ytdl(servidores[msg.guild.id][0]))
        .on('end', () => {
            if (servidores[msg.guild.id].length > 0){
                servidores[msg.guild.id].shift();
                tocarMusica(msg);
            }
        });
}

app.login(TOKEN_DISCORD);
*/


//THIAGO BELEREN CODE
/*
//APIS
const Discord = require(`discord.js`)
const ytdl = require(`ytdl-core`)
const configs = require(`./configs.json`)
const google = require(`googleapis`)
const prefixo = configs.prefixo

const youtube = new google.youtube_v3.Youtube(
    {
        version: `v3`,
        auth: configs.TOKEN_GOOGLE
    }
)

const client = new Discord.Client()
const servidores = {
    'server': {
        connection: null,
        dispatcher: null,
        fila: [],
        tocando: false,
    }
}

                        //BOT
client.on(`ready`, () => {
    console.log(`Pronto pra festa!`)
})

client.on(`message`, async (msg) => {
//filtros
    if (!msg.guild) return

    if (!msg.content.startsWith(prefixo)) return

    if (!msg.member.voice.channel) {
        msg.channel.send(`Voce precisa estar no canal de voz para usar esss recurso!`) 
        return
    }

//Music Bot
    if(msg.content.startsWith(prefixo + `p`)) { //pra tocar + url do yt

        let ytdlsearch = msg.content.slice(3) //-p <link> 
        
        if (ytdlsearch.length === 0){
            msg.channel.send('Preciso de um link para tocar')
            return
        }

        if (servidores.server.connection === null){ // junta automaticamente ao canal de voz, se nao estiver no caso!
            try {
                servidores.server.connection = await msg.member.voice.channel.join()
            } catch (erro) {
                console.log(`Erro ao tentar entrar no canal de voz`)
                console.log(erro)
            }
        }

        if (ytdl.validateURL(ytdlsearch)) {
            servidores.server.fila.push(ytdlsearch)
            console.log('Adicionei a musica: '+ id)
            tocarmusica()
        } else {
            youtube.search.list(
                {
                    q: ytdlsearch,
                    part: `snippet`,
                    fields: 'items(id(videoId)), snippet(title))',
                    type: 'video'
                }, function (erro, resultado) {
                    if (erro) {
                        console.log(erro)
                    }
                    if (resultado) {
                       const id = resultado.data.items[0].id.videoId
                       ytdlsearch = 'htttps://www.youtube.com/watch?v=' + id
                       servidores.server.fila.push(ytdlsearch)
                       console.log('Adicionei a musica: '+ id +' para a fila')
                       tocarmusica()
                    }
                }
            )
        }
        
}

    if (msg.content === prefixo + `leave`) { //pro bot sair
        msg.member.voice.channel.leave()
        servidores.server.connection = null
        servidores.server.dispatcher = null
}

    if (msg.content === prefixo + `join`) { //pro bot entrar 
    
}

    if (msg.content === prefixo + `pause`) { //pro bot pausar 
        servidores.server.dispatcher.pause()
}

    if (msg.content === prefixo + `resume`) { //pro bot voltar ao normal
        servidores.server.dispatcher.resume()
    }
}) 

const tocarmusica = () => {

    if (servidores.server.tocando === false){
    const tocando_playlist = servidores.server.fila[0]
    servidores.server.tocando = true
    servidores.server.dispatcher = servidores.server.connection.play(ytdl(tocando_playlist, configs.YTDL))
}
    servidores.server.dispatcher.on('finish', () => { 
        servidores.server.fila.shift() //shift() elimina o primeiro item da lista
        servidores.server.tocando = false

        if (servidores.server.fila.length > 0) {
            tocarmusica()
        } else {
            servidores.server.connection.disconnect()
        }
    })
}

client.login(configs.TOKEN_DISCORD) 
*/

//creditos a joao pimenta `youtube`

//npm init -y
//instale a biblioteca do discord `npm install discord.js` ou `npm install discord.js@12.5.1`
//no cmd instale essa biblioteca de musica: `npm install ffmpeg-static` ou `npm install ffmpeg-static@4.3.0`
//no  cmd instale o conversor de string em audio `npm install @discordjs/opus` ou `npm install @discordjs/opus@0.5.0`
// pra ligar o bot eh so abrir o cmd e colocar `cd e o lugar da pasta` e depois `node nomedoprojeto.js`
//pra colocar a biblioteca do youtube `npm install ytdl-core ou nom install ytdl-core@4.5.0`
//colocar suas api da google `npm install googleapis`
//pra colocar a api do spotify*/
