// 把 URL 存成變數，在程式碼中寫變數即可 (易維護)
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = []; // 宣告 movies 陣列，供稍後存入電影資料
let filteredMovies = []; // 篩選過的電影空陣列
const dataPanel = document.querySelector("#data-panel"); // 找出 80 張卡片要塞進 html 檔的位置，也就是 #data-panel
const searchForm = document.querySelector("#search-form"); // 儲存 search bar 表單
const searchInput = document.querySelector("#search-input"); // search bar 的 input 欄位
const paginator = document.querySelector("#paginator"); // 分頁器
const modeChangeSwitch = document.querySelector("#view-switch"); // 切換顯示

// 記錄目前分頁，切換模式時，分頁才不會跑掉，且搜尋時不會顯示錯誤
let currentPage = 1;

// 函式：輸出電影資料畫面，此函式會在下方 axios 以及其他程式碼中調用
function renderMovieList(data) {
  // 卡片模式
  if (dataPanel.dataset.mode === "card-mode") {
    showCardMode(data);
  }
  // 清單模式
  else if (dataPanel.dataset.mode === "list-mode") {
    showListMode(data);
  }
}

// 2022.05.27 新增函式：以卡片模式輸出
// 對 data 陣列的每個元素都進行 HTML 繪製，用 forEach 迴圈，在 More 按鈕上，綁了 item 的 ID
function showCardMode(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id
      }"}">More</button> 
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// 2022.05.27 新增函式：以清單模式輸出
function showListMode(data) {
  let rawHTML = `
    <ul class="list-group col-sm-12 mb-2">
  `;
  data.forEach(function (item) {
    rawHTML += `
          <li class="list-group-item d-flex justify-content-between">
            <h5 class="movie-title-list-view">${item.title}</h5>
            <div class="movie-button-group">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
              data-bs-target="#movie-modal" data-id="${item.id}"}">More</button> 
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </li>
        `;
  });
  rawHTML += `
        </ul>
    `;
  dataPanel.innerHTML = rawHTML;
}

// 函式：輸出分頁器的外觀
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

// 函式：帶入頁碼，顯示每頁相對應的電影
function getMoviesByPage(page) {
  // 如果搜尋結果有東西，則使用 filteredMovies，如果沒有，則使用 movies
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 函式：顯示電影詳情 (modal)
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  // 2022.05.27 新增這裡：每次執行前，先將 modal 內容清空，以免前一個電影的資料殘影還在
  modalTitle.innerText = "";
  modalImage.innerHTML = "";
  modalDate.innerText = "";
  modalDescription.innerText = "";

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}

// 函式：加到最愛
function addToFavorite(id) {
  //console.log(id)
  //宣告收藏電影清單 list，由於 getItem 取得的是 JSON 字串，所以用 JSON.parse 轉換為 JS 物件，才能賦值給 list
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  //在 movies 陣列中，逐一比對，如果遇到一部電影的 id (movie.id) 跟函式帶入的參數 id 相同，就回傳該電影，並停止比對
  const movie = movies.find((movie) => movie.id === id);
  //list 陣列中，如果遇有電影的 id 跟函式帶入的參數 id 相同，就跳提示訊息
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  //把 movie 加入 list
  list.push(movie);
  //把 list 存放在 local Storage，因為 list 是 JS 物件，用 JSON.stringify 轉成 JSON 字串，才能放進 local storage
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 監聽器：data panel (more 或是 add)
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 監聽器：按分頁器的頁碼，顯示相對應的電影
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  //console.log(event.target.dataset.page)
  const page = Number(event.target.dataset.page);
  currentPage = page;
  renderMovieList(getMoviesByPage(currentPage));
});

// 監聽器：搜尋電影標題
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //防止瀏覽器預設行為 (跳轉)
  event.preventDefault();
  //取得 input 輸入值，刪除前後空白，改為小寫
  const keyword = searchInput.value.trim().toLowerCase();

  //篩選過的電影空陣列 filteredMovies 已移到開頭，變成全域變數

  // 2022.05.27 修改：若輸入無效字串 (一堆空白或根本沒輸入)，根據「所有電影」輸出分頁器和第一頁資料
  if (!keyword.length) {
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
    // 刪除這裡：return alert("請輸入有效的值!");
  }
  //用 filter 篩選 movies 陣列中，標題包含 keyword 的電影
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  //處理無符合的情況
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字 ${keyword} 沒有符合的結果!`);
  }
  //重新輸出分頁器，電影數量為篩選過的電影數量
  currentPage = 1;
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(currentPage));
});

// 函式：依 data-mode 切換顯示模式
function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return;
  dataPanel.dataset.mode = displayMode;
}

// 監聽模式切換事件
modeChangeSwitch.addEventListener("click", function onViewSwitchClicked(event) {
  if (event.target.matches("#btn-card-mode")) {
    changeDisplayMode("card-mode");
  } else if (event.target.matches("#btn-list-mode")) {
    changeDisplayMode("list-mode");
  }
  renderMovieList(getMoviesByPage(currentPage));
});

axios
  .get(INDEX_URL)
  .then((response) => {
    // response.data.results 是個有80筆電影資料的陣列
    // 用 .push 加上展開運算子，把 response.data.results 的 80 筆資料，一個個加入 movies 陣列
    movies.push(...response.data.results);
    //console.log(movies)
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((error) => {
    console.log(error);
  });
