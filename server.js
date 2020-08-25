/**
 * @file This is the back-end server side code. Currently, implemented API are listed below:
 * Stream API: /stream?id=<youtubeId>
 * @author NanKe
 */
const express = require('express');
const ytdl = require('ytdl-core');
const https = require('https');

const { installHandler } = require('./graphQL_handler.js');
const { connectToDb } = require('./db.js');


const app = express();

// handle env variable here
const PORT = process.env.PORT || 7777;


/**
 * Route for stream API, return a readable stream to client
 */
app.get('/stream', (req, res) => {
  let youtubeId = req.query.id;
  let ip = req.ip;

  let resLock = false;

  // default filter 
  let filter = 'audioonly';
  // this filter drop the result that is dashMPD, which doesn't have response event 
  // let filter = format => format.isDashMPD === false ;
  let ua = req.get('User-Agent');
  let isSafari = ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1;
  // dectect safari, then change the filter
  if (isSafari) {
    console.log(`request by safari`);
    filter = format => format.container === 'mp4';
  }

  if (youtubeId) {
    console.log(`${new Date()}: Get request for video ${youtubeId} from ${ip}`);

    let stream;
    let start, end;
    let range = req.get('Range');
    // if request contain Range option in header, handle range option
    if (range) {
      // ! debug, logging req range
      console.log(`Range ${range}`);
      let positions = range.replace(/bytes=/, "").split("-");
      start = parseInt(positions[0], 10);
      if (positions.length > 1) end = parseInt(positions[1], 10);

      if (!Number.isNaN(start) && end) {
        stream = ytdl(`https://www.youtube.com/watch?v=${youtubeId}`, { quality: 'highestaudio', range: { start, end }, filter });
      } else {
        stream = ytdl(`https://www.youtube.com/watch?v=${youtubeId}`, { quality: 'highestaudio', range: { start }, filter });
      }

    } else {
      stream = ytdl(`https://www.youtube.com/watch?v=${youtubeId}`, { quality: 'highestaudio', filter });
    }

    // there is a possible bug for response event, it can emitted twice for a single request

    // set up header when Event:reaponse emitted(video response has been found)
    stream.on('response', Ytbres => {
      // set content length to indicate server support range header
      // use the header from youtbe in response
      // if this is the first response event(we don't want to double response to client) 
      if (!resLock) {
        // lock, prevent double response
        resLock = true;
        res.set(Ytbres.headers);
        res.status(Ytbres.statusCode);
        stream.pipe(res);
      }


      // ! Debug code for header/statusCode
      console.log(`----Response Header for request ${youtubeId}----`);
      console.log(`StatusCode: ${Ytbres.statusCode}`);
      console.log(Ytbres.headers);
      console.log(`----Response Header End----`);
    });

    // error handling for readable stream
    stream.on('error', err => {
      console.log(`${new Date()}: Youtube readable stream error, video id=${youtubeId}`);
      console.log('----Error Info----');
      console.log(err);
      console.log('----Error Info End----');
    });

    // error handling for writable stream (response)
    res.on('error', err => {
      console.log(`${new Date()}: Error in response stream, video id=${youtubeId}`);
    });

    // log video info, handle the DashMPD format(no response event)
    stream.on('info', function (info, format) {
      console.log('----Audio information----');
      console.log(`Title=${info.videoDetails.title}`);
      console.log(`audioQuality=${format.audioQuality} audioBitrate=${format.audioBitrate} audioCodec=${format.audioCodec}`);
      console.log(`container=${format.container} isDashMPD=${format.isDashMPD} isLive=${format.live}`)
      console.log('----Audio info end----')
      // if is DashMPD format and not live video, we should set our header
      if (format.isDashMPD && !format.live) {

        // get url from info, match the itag
        let resFormat = info.player_response.streamingData.adaptiveFormats;
        let url, contentLength, lastModified;
        resFormat.forEach(element => {
          if (element.itag == format.itag) {
            // !debug, log format info
            // console.log(element)
            url = element.url;
            contentLength = element.contentLength;
            lastModified = element.lastModified;
          }
        });


        if (url) {
          // if we have range request, and not from 0, we should specified it on headers
          if (start !== 0) {
            let option = {
              headers: {
                'if-range': new Date(parseInt(lastModified, 10) / 1000).toUTCString(),
              }
            };
            // check if we have end range
            if (!Number.isNaN(end)) {
              option.headers['Range'] = `bytes=${start}-${end}`;
            } else {
              // we should fill it with contentlength
              option.headers['Range'] = `bytes=${start}-${parseInt(contentLength, 10) - 1}`;
            }
            // !debug, log request header 
            // console.log(option.headers);

            // shot the request 
            https.get(url, option, yRes => {
              // error handling for response from youtube (readable stream)
              yRes.on('error', e => {
                console.log(`${new Date()}: Error on response from youtube`);
              });

              // log respose for debug
              console.log(`----Response Header for request ${youtubeId}----`)
              console.log(`StatusCode: ${yRes.headers}`);
              console.log(yRes.statusCode);
              console.log(`----Response Header End----`)

              res.set(yRes.headers);
              res.status(yRes.statusCode);
              // all set, pipe youtube response to client
              yRes.pipe(res);
            }).on('error', e => {
              console.log(`${new Date()}: Error on sending get request to youtube`);
            });

          } else {
            // if no range request, send request directly
            https.get(url, (yRes) => {
              // error handling for response from youtube (readable stream)
              yRes.on('error', e => {
                console.log(`${new Date()}: Error on response from youtube`);
              });

              // log respose for debug
              console.log(`----Response Header for request ${youtubeId}----`)
              console.log(`StatusCode: ${yRes.headers}`);
              console.log(yRes.statusCode);
              console.log(`----Response Header End----`)

              res.set(yRes.headers);
              res.status(yRes.statusCode);
              yRes.pipe(res);
            }).on('error', e => {
              console.log(`${new Date()}: Error on sending get request to youtube`);
            });
          }


        } else {
          // if no url get, we cannot offer content
          res.status(400).send('Bad Request');
        }

      }
    })

    // stream.on('progress', (chunkLength, downloaded, total) => {
    //   console.log(chunkLength);
    //   console.log(total);
    // });

    // !debug, log when stream end
    stream.on('end', () => {
      console.log(`${new Date()}: streaming to ${ip} end, video id=${youtubeId}`);
    });

    // !debug, log when stream close
    stream.on('close', () => {
      console.log(`${new Date()}: streaming to ${ip} closed, video id=${youtubeId}`);
    });


  } else {
    res.status(400).send('Bad Request');
  }
});

installHandler(app);

(async function start() {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`${new Date()}: API server started on port ${PORT}`);
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
}());
