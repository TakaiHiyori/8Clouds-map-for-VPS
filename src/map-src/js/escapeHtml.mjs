export const escapeHtml = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(/[&'`"<>]/g, (match) => {
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[match];
  });
};

export const ConversionRichTextValue = (value) => {
  return value.replace("<div>", "").replace(/<div>/g, "").replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "")
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&#34;/g, '"').replace(/&#61;/g, '=').replace(/&#64;/g, '@').replace(/&#96;/g, '`').replace(/&#43;/g, '+')
      .replace(/&#xff41;/g, 'ａ').replace(/&#xff42;/g, 'ｂ').replace(/&#xff43;/g, 'ｃ').replace(/&#xff44;/g, 'ｄ').replace(/&#xff45;/g, 'ｅ').replace(/&#xff46;/g, 'ｆ')
      .replace(/&#xff47;/g, 'ｇ').replace(/&#xff48;/g, 'ｈ').replace(/&#xff49;/g, 'ｉ').replace(/&#xff4a;/g, 'ｊ').replace(/&#xff4b;/g, 'ｋ').replace(/&#xff4c;/g, 'ｍ')
      .replace(/&#xff4d;/g, 'ｎ').replace(/&#xff4e;/g, 'ｌ').replace(/&#xff4f;/g, 'ｏ').replace(/&#xff50;/g, 'ｐ').replace(/&#xff51;/g, 'ｑ').replace(/&#xff52;/g, 'ｒ')
      .replace(/&#xff53;/g, 'ｓ').replace(/&#xff54;/g, 'ｔ').replace(/&#xff55;/g, 'ｕ').replace(/&#xff56;/g, 'ｖ').replace(/&#xff57;/g, 'ｗ').replace(/&#xff58;/g, 'ｘ')
      .replace(/&#xff59;/g, 'ｙ').replace(/&#xff5a;/g, 'ｚ')
      .replace(/&#xff21;/g, 'Ａ').replace(/&#xff22;/g, 'Ｂ').replace(/&#xff23;/g, 'Ｃ').replace(/&#xff24;/g, 'Ｄ').replace(/&#xff25;/g, 'Ｅ').replace(/&#xff26;/g, 'Ｆ')
      .replace(/&#xff27;/g, 'Ｇ').replace(/&#xff28;/g, 'Ｈ').replace(/&#xff29;/g, 'Ｉ').replace(/&#xff2a;/g, 'Ｊ').replace(/&#xff2b;/g, 'Ｋ').replace(/&#xff2c;/g, 'Ｍ')
      .replace(/&#xff2d;/g, 'Ｎ').replace(/&#xff2e;/g, 'Ｌ').replace(/&#xff2f;/g, 'Ｏ').replace(/&#xff30;/g, 'Ｐ').replace(/&#xff31;/g, 'Ｑ').replace(/&#xff32;/g, 'Ｒ')
      .replace(/&#xff33;/g, 'Ｓ').replace(/&#xff34;/g, 'Ｔ').replace(/&#xff35;/g, 'Ｕ').replace(/&#xff36;/g, 'Ｖ').replace(/&#xff37;/g, 'Ｗ').replace(/&#xff38;/g, 'Ｘ')
      .replace(/&#xff39;/g, 'Ｙ').replace(/&#xff3a;/g, 'Ｚ')
      .replace(/&#xff01;/g, '！').replace(/&#xff03;/g, '＃').replace(/&#xff04;/g, '＄').replace(/&#xff05;/g, '％').replace(/&#xff06;/g, '＆').replace(/&#xff08;/g, '（')
      .replace(/&#xff09;/g, '）').replace(/&#xff0a;/g, '＊').replace(/&#xff0b;/g, '＋').replace(/&#xff0c;/g, '、').replace(/&#xff0d;/g, '＿')
      .replace(/&#xff0f;/g, '／').replace(/&#xff10;/g, '０').replace(/&#xff11;/g, '１').replace(/&#xff12;/g, '２').replace(/&#xff13;/g, '３').replace(/&#xff14;/g, '４')
      .replace(/&#xff15;/g, '５').replace(/&#xff16;/g, '６').replace(/&#xff17;/g, '７').replace(/&#xff18;/g, '８').replace(/&#xff19;/g, '９').replace(/&#xff1a;/g, '：')
      .replace(/&#xff1b;/g, '；').replace(/&#xff1c;/g, '＜').replace(/&#xff1d;/g, '＝').replace(/&#xff1e;/g, '＞').replace(/&#xff1f;/g, '？').replace(/&#xff20;/g, '＠')
      .replace(/&#xff3c;/g, '＼').replace(/&#xff3d;/g, '］').replace(/&#xff3e;/g, '＾').replace(/&#xff3f;/g, '＿').replace(/&#xff40;/g, '｀').replace(/&#xff5b;/g, '｛')
      .replace(/&#xff5c;/g, '｜').replace(/&#xff5d;/g, '｝').replace(/&#xff5e;/g, '～').replace(/&#xff61;/g, '。')
      .replace(/&#xff64;/g, '､').replace(/&#xff65;/g, '･').replace(/&#xffe5;/g, '￥');
}