const logger = require('../logger');

/*function announceStreamLive(event_data) {
  if (event_data && event_data.type === 'live') {
    let user_id = event_data.broadcaster_user_id;
    let user_name = event_data.broadcaster_user_name;
    logger.info('DiscordBot - announceStreamLive: Streamer ' + user_name);
    // Get user profile image
    twitch
      .getUserProfile(user_id, user_name)
      .then((user_data) => {
        let profile_image_url = user_data.profile_image_url;
        // Get stream data
        twitch
          .getStreamData(user_id)
          .then((stream) => {
            // Preview
            const preview = stream.thumbnail_url
              .replace('{width}', '320')
              .replace('{height}', '240'); // + '?time=' + new Date().getTime();
            // Crear el anuncio
            let title = stream.title;
            if (stream.is_mature) {
              title += ' (+18)';
            }
            let gameName = stream.game_name ? stream.game_name : '???';

            const announce = new EmbedBuilder()
              .setColor(0x9147ff)
              .setTitle(stream.title)
              .setURL('https://www.twitch.tv/' + stream.user_name)
              .setAuthor({
                name: stream.user_name,
                iconURL:
                  'https://upload.wikimedia.org/wikipedia/commons/3/3a/Twitch_mit_Glitch.png',
                url: 'https://www.twitch.tv/' + stream.user_name,
              })
              .setDescription(
                `Eh, ${stream.user_name} esta en directo en Twitch! Dale un vistazo!`
              )
              .setThumbnail(profile_image_url)
              .addFields([
                {
                  name: 'Game',
                  value: gameName,
                  inline: true,
                },
                {
                  name: 'Viewers',
                  value: String(stream.viewer_count),
                  inline: true,
                },
              ])
              .setImage(preview);

            // Buscar el usuario
            let users = firebasedb.getUsers();
            for (id in users) {
              if (users[id]['id-twitch'] == user_id) {
                config.twitchNotices.channels.forEach((c) => {
                  // Busco el canal en la guild
                  bot.guilds.cache.forEach((guild) => {
                    // Miramos si el canal es de la guild
                    let channel = guild.channels.cache.get(c);
                    if (channel) {
                      // Miramos si el usuario es del canal
                      guild.members
                        .fetch(id)
                        .then((m) => {
                          // Mandamos el anuncio
                          channel.send({ embeds: [announce] });
                        })
                        .catch((e) => { });
                    }
                  });
                });
                break;
              }
            }
          })
          .catch((e) => {
            logger.error(
              'DiscordBot - announceStreamLive: ERROR in getStreamData ' + e
            );
          });
      })
      .catch((e) => {
        logger.error(
          'DiscordBot - announceStreamLive: ERROR in getUserProfile ' + e
        );
      });
  }
}

function onStreamNotification(bot, req, res) {
  // Verify header
  logger.debug('Received TWITCH EVENT: ' + JSON.stringify(req.headers));
  hmac_message = req.headers['twitch-eventsub-message-id'] + req.headers['twitch-eventsub-message-timestamp'] + JSON.stringify(req.body)
  expected_signature_header = 'sha256=' + cryptoJS.HmacSHA256(hmac_message, twitch.secret);

  if (req.headers['twitch-eventsub-message-signature'] == expected_signature_header) {
    logger.debug('Received TWITCH EVENT: ' + JSON.stringify(req.body));
    subscription = req.body["subscription"]
    event_data = req.body["event"]
    challenge = req.body["challenge"]

    // Process event
    if (event_data) {
      switch (subscription["type"]) {
        case "stream.online":
          announceStreamLive(event_data);
          break;
        default:
          logger.warn("Received unknown event twitch type: " + subscription["type"])
      }
    }
    if (challenge) {
      res.send(challenge);
    } else {
      res.sendStatus(200);
    }
  } else {
    logger.error("FAILED VERIFY TWITCH SIGNATURE: expected = " + expected_signature_header + " received = " + req.headers['Twitch-Eventsub-Message-Signature']);
    res.sendStatus(403);
  }
}*/