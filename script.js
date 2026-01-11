const body = document.querySelector("body");
const container = body.querySelector(".container");
const darkModeBtn = document.getElementById("dark-mode");
const tBody = container.querySelector("tbody");
const nextPage = container.querySelector(".fa-arrow-right");
const prevPage = container.querySelector(".fa-arrow-left");
const pageNumber = container.querySelector(".pagination-btns > span");
const sortingBtns = container.querySelectorAll("thead span");

let currentPage = getUsers();

async function getUsers() {
  try {
    container.dataset.state = "loading";

    // Small pause for spinning loader demonstration :)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const res = await fetch("https://randomuser.me/api/?results=50");
    if (!res.ok) throw new Error(res.error);
    const data = await res.json();
    currentPage = createPage(data);
    currentPage();

    nextPage.addEventListener("click", () => {
      currentPage.next();
      currentPage();
    });
    prevPage.addEventListener("click", () => {
      currentPage.previous();
      currentPage();
    });
    container.dataset.state = "off";
  } catch (e) {
    console.error(e.message);
    container.dataset.state = "loading";
  }
}

function createPage(data, resultsPerPage = 10) {
  let currentIndex = JSON.parse(localStorage.getItem("savedIndex")) ?? 0;

  sortingBtns.forEach((btn) => {
    btn.addEventListener("click", sortingHandler);
  });
  let currentHTML = dataToHTML(data).slice(
    resultsPerPage * currentIndex,
    resultsPerPage * (currentIndex + 1)
  );

  displayPage.next = () => {
    currentIndex++;
    currentHTML = dataToHTML(data).slice(
      resultsPerPage * currentIndex,
      resultsPerPage * (currentIndex + 1)
    );
  };
  displayPage.previous = () => {
    currentIndex--;
    currentHTML = dataToHTML(data).slice(
      resultsPerPage * currentIndex,
      resultsPerPage * (currentIndex + 1)
    );
  };
  displayPage.clear = () => {
    currentHTML = "";
  };

  function displayPage() {
    switch (currentIndex) {
      case 0:
        prevPage.style.display = "none";
        break;
      // this case according to results asked from API,can be generalised
      case 4:
        nextPage.style.display = "none";
        break;
      default:
        nextPage.style.display = "inline";
        prevPage.style.display = "inline";
    }

    tBody.innerHTML = currentHTML.join("");
    pageNumber.textContent = currentIndex + 1;
  }
  function sortingHandler(e) {
    //stop Event Listeners on sorting buttons from duplicating
    sortingBtns.forEach((btn) => {
      btn.removeEventListener("click", sortingHandler);
    });
    localStorage.setItem("savedIndex", JSON.stringify(currentIndex));
    const tableHeaderClicked = e.target.closest("th").textContent.trim();
    if (tableHeaderClicked !== createPage.lastTableHeaderClicked) {
      sortingBtns.forEach((btn) => {
        btn.lastElementChild.style.visibility = "visible";
        btn.firstElementChild.style.visibility = "visible";
      });
    }
    if (tableHeaderClicked === createPage.lastTableHeaderClicked) {
      data.results.reverse();
      currentPage = createPage(data);
      currentPage();

      e.target.closest("th").querySelector(".fa-caret-up").style.visibility =
        e.target.closest("th").querySelector(".fa-caret-down").style
          .visibility === "hidden"
          ? "hidden"
          : "visible";
      e.target.closest("th").querySelector(".fa-caret-down").style.visibility =
        e.target.closest("th").querySelector(".fa-caret-up").style
          .visibility === "hidden"
          ? "visible"
          : "hidden";
      return;
    }
    sortingData(tableHeaderClicked, data);
    currentPage = createPage(data);
    currentPage();
    e.target.parentNode.lastElementChild.style.visibility = "hidden";
    createPage.lastTableHeaderClicked = tableHeaderClicked;
  }

  return displayPage;
}

function sortingData(sortField, data) {
  switch (sortField) {
    case "Name":
      data.results.sort((a, b) => a.name.last.localeCompare(b.name.last));
      break;
    case "Email":
      data.results.sort((a, b) => a.email.localeCompare(b.email));
      break;
    case "Username":
      data.results.sort((a, b) =>
        a.login.username.localeCompare(b.login.username)
      );
      break;
    case "Country":
      data.results.sort((a, b) =>
        a.location.country.localeCompare(b.location.country)
      );
      break;
  }
}
function dataToHTML(data) {
  const { results } = data;
  const resultsArr = Array.from(results);
  // for brevity's sake :)
  const resultsArrToHTML = resultsArr.map((item) => {
    return `<tr>
                     <td>${item.name.last + " " + item.name.first}</td>
                     <td>${item.email}</td>
                     <td>${item.login.username}</td>
                     <td>${item.location.country}</td>
                  </tr>`;
  });
  return resultsArrToHTML;
}

darkModeBtn.addEventListener("click", () => {
  document.startViewTransition(() => {
    body.classList.toggle("dark-mode");
  });
  if (body.classList.contains("dark-mode")) {
    darkModeBtn.textContent = "Light mode";
  } else {
    darkModeBtn.textContent = "Dark mode";
  }
});
