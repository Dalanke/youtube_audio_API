/**
 * @file This module is the graphql resolvers, handle music related query/mutation
 * 
 */

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

// Stream server variable
const STREAM_SERVER = process.env.STREAM_SERVER || 'http://localhost:7777';

async function getMusicInfo(parent, { url }) {
  if (ytdl.validateURL(url)) {
    const info = await ytdl.getBasicInfo(url);
    const thumb = info.videoDetails.thumbnail.thumbnails
    const result = {
      src: `${STREAM_SERVER}/stream?id=${info.videoDetails.videoId}`,
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      thumbnail: thumb[thumb.length - 1].url
    }
    return result;
  } else {
    return {
      src: null,
      title: '',
      author: '',
      thumbnail: ''
    };
  }
}

async function searchMusic(parent, { keyword }) {
  ytsr.do_warn_deprecate = false;
  try {
    const filter = await ytsr.getFilters(keyword);
    // get video only filter
    const videoOnly = filter.get('Type').find(o => o.name === 'Video');
    // limit search result to 12
    const option = {
      limit: 12,
      nextpageRef: videoOnly.ref,
    };
    try {
      const result = await ytsr(null, option);
      return result.items.map((item) => {
        return {
          src: item.link.replace('https://www.youtube.com/watch?v=', `${STREAM_SERVER}/stream?id=`),
          title: item.title,
          author: item.author.name,
          thumbnail: item.thumbnail
        }
      });
    } catch (error) {
      throw new Error(`Search error for keyword: ${keyword}`);
    }
  } catch (error) {
    throw new Error(`Search error for keyword: ${keyword}`);
  }
}


module.exports = { getMusicInfo, searchMusic };