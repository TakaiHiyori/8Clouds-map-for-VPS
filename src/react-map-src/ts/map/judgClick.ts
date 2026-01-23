
export const judgClick = (e: any) => {
  if (!e.originalEvent || e.originalEvent.target.tagName === 'BUTTON') {
    //クリックした場所が見当たらない、もしくはボタンをクリックした場合は何もしない
  } else if (e.originalEvent.target.tagName === 'HEADER' || e.originalEvent.target.id === 'map' || e.originalEvent.target.id === 'map-title') {
    $('.select-options').hide()
    $('#address_search_modal').hide()
    $('#search_modal').hide()
    $('#logout-config').hide()
  } else if (e.originalEvent.target.className !== '') {
    if (e.originalEvent.target.className.baseVal) {
      if ($('#map .' + e.originalEvent.target.className.baseVal.split(' ')[0]).length >= 1) {
        $('.select-options').hide()
        $('#address_search_modal').hide()
        $('#search_modal').hide()
        $('#logout-config').hide()
      }
    } else {
      if ($('#map .' + e.originalEvent.target.className.split(' ')[0]).length >= 1) {
        $('.select-options').hide()
        $('#address_search_modal').hide()
        $('#search_modal').hide()
        $('#logout-config').hide()
      }
    }
  }
}