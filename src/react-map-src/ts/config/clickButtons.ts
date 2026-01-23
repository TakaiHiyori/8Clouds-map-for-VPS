
export const showUserList = (e: any) => {
  console.log(e)
  const showUserList: any = document.getElementById('show_user_list');
  const userEdit: any = document.getElementById('user_edit');
  const mapList: any = document.getElementById('map_list');
  const mapConfig: any = document.getElementById('map_config');
  const mapContract: any = document.getElementById('map_contract');
  showUserList.style.display = 'block';
  userEdit.style.display = 'none';
  mapList.style.display = 'none';
  mapConfig.style.display = 'none';
  mapContract.style.display = 'none';
}

export const addUserClick = () => {
  const showUserList: any = document.getElementById('show_user_list');
  const userEdit: any = document.getElementById('user_edit');
  const mapList: any = document.getElementById('map_list');
  const mapConfig: any = document.getElementById('map_config');
  const mapContract: any = document.getElementById('map_contract');
  showUserList.style.display = 'none';
  userEdit.style.display = 'block';
  mapList.style.display = 'none';
  mapConfig.style.display = 'none';
  mapContract.style.display = 'none';
}

export const showMapList = () => {
  const showUserList: any = document.getElementById('show_user_list');
  const userEdit: any = document.getElementById('user_edit');
  const mapList: any = document.getElementById('map_list');
  const mapConfig: any = document.getElementById('map_config');
  const mapContract: any = document.getElementById('map_contract');
  showUserList.style.display = 'none';
  userEdit.style.display = 'none';
  mapList.style.display = 'block';
  mapConfig.style.display = 'none';
  mapContract.style.display = 'none';
}

export const addMapClick = () => {
  const showUserList: any = document.getElementById('show_user_list');
  const userEdit: any = document.getElementById('user_edit');
  const mapList: any = document.getElementById('map_list');
  const mapConfig: any = document.getElementById('map_config');
  const mapContract: any = document.getElementById('map_contract');
  showUserList.style.display = 'none';
  userEdit.style.display = 'none';
  mapList.style.display = 'none';
  mapConfig.style.display = 'block';
  mapContract.style.display = 'none';
}

export const showContractList = () => {
  const showUserList: any = document.getElementById('show_user_list');
  const userEdit: any = document.getElementById('user_edit');
  const mapList: any = document.getElementById('map_list');
  const mapConfig: any = document.getElementById('map_config');
  const mapContract: any = document.getElementById('map_contract');
  showUserList.style.display = 'none';
  userEdit.style.display = 'none';
  mapList.style.display = 'none';
  mapConfig.style.display = 'none';
  mapContract.style.display = 'block';
}