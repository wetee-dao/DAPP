import { Base64 } from 'js-base64';
import hmacSHA1 from 'crypto-js/hmac-sha1';
import Base64Enc from 'crypto-js/enc-base64';

function random_string(len) {
  len = len || 32;
  var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = chars.length;
  var pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

function getType(name) {
  let str = name.split(".")
  return str[str.length - 1]
}

function getUploadForm(accessid, accesskey, file, md5) {
  let policyText = {
    "expiration": "2030-01-01T12:00:00.000Z", //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
    "conditions": [
      ["content-length-range", 0, 1048576000] // 设置上传文件的大小限制
    ]
  };

  let policyBase64 = Base64.encode(JSON.stringify(policyText))
  let signature = Base64Enc.stringify(hmacSHA1(policyBase64, accesskey))
  let name = md5 + "." + getType(file.name)
  return {
    'key': name,
    'policy': policyBase64,
    'OSSAccessKeyId': accessid,
    'success_action_status': '200', //让服务端返回200,不然，默认会返回204
    'signature': signature,
  }
}

export default {
  getUploadForm
}