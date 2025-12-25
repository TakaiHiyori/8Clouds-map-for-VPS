
export const clickDrawLine = (drawLine: boolean) => {
  if (drawLine) {
    drawLine = false;
    $('#draw_line').css({ 'background': '#ededed', 'box-shadow': '1px 1px 0px 0px #818181' });
    document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'grab';
  } else {
    drawLine = true;
    $('#draw_line').css({ 'background': '#bdbdbd', 'box-shadow': 'inset rgb(129, 129, 129) 1px 1px 2px 2px' });
    document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'crosshair';
  }

  return drawLine
}

export const clickDrawCircle = (drawCircle: boolean) => {
  if (drawCircle) {
    drawCircle = false;
    $('#draw_circle').css({ 'background': '#ededed', 'box-shadow': '1px 1px 0px 0px #818181' });
    document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'grab';
  } else {
    drawCircle = true;
    $('#draw_circle').css({ 'background': '#bdbdbd', 'box-shadow': 'inset rgb(129, 129, 129) 1px 1px 2px 2px' });
    document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'pointer';
    return drawCircle
  }
}

export const clickDrawArea = (drawArea: boolean) => {
  if (drawArea) {
    drawArea = false;
    $('#draw_area').css({ 'background': '#ededed', 'box-shadow': '1px 1px 0px 0px #818181' });
    document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'grab';
  } else {
    drawArea = true;
    $('#draw_area').css({ 'background': '#bdbdbd', 'box-shadow': 'inset rgb(129, 129, 129) 1px 1px 2px 2px' });
    document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'crosshair';
  }
  return drawArea
}