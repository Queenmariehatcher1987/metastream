import { load } from 'cheerio';
import { MediaThumbnailSize, IMediaRequest, IMediaMiddleware, IMediaResponse } from '../types';
import { fetchText, fetchResponse } from 'utils/http';
import { Url } from 'url';
import { basename } from 'path';
import { MEDIA_USER_AGENT } from 'constants/http';

/** https://www.w3.org/Protocols/rfc1341/4_Content-Type.html */
const getContentType = (val?: string) => (val ? (val.split('/').shift() || '').toLowerCase() : '');

const mware: IMediaMiddleware = {
  match({ protocol }: Url) {
    return protocol === 'http:' || protocol === 'https:';
  },

  async resolve(req, res, next) {
    const { url } = req;

    // Request HEAD response to check MIME type
    const response = await fetchResponse(url.href, {
      method: 'HEAD',
      headers: {
        'user-agent': MEDIA_USER_AGENT
      }
    });

    const code = response.statusCode || 200;
    // if (code >= 400) {
    //   return;
    // }

    const contentType: string | undefined = response.headers['content-type'];
    const type = getContentType(contentType);

    res.responseCode = code;
    res.contentType = contentType;
    res.type = type;

    return next();
  }
};

export default mware;
