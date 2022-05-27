//Infinite scroll script

/**
 * PLAN: Functions I should create.
 *
 * I need something to handle the intersecting
 * intersectionHandler()
 *
 * Don't need to fetch data, so all I just have to create each element with JS and input the data
 * createElement()
 */

// When DOM is loaded, so I can select the footer.
document.addEventListener("DOMContentLoaded", () => {
    // console.log(document.querySelector('footer'))

    // Index selector for scrollCampgrounds, incremented in populate();
    let campCounter = 0;

    // Set options for Intersection Observer
    let options = {
        root: null,
        rootMargins: "0px",
        threshold: 0.5,
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(document.querySelector("footer"));

    function handleIntersect(oberserverEntries) {
        if (campCounter < scrollCampgrounds.length) {
            if (oberserverEntries[0].isIntersecting) {
                console.warn("something is intersecting with the viewport");
                populateCampgrounds();
            }
        }
    }

    function populateCampgrounds() {
        //Populate 5 times
        for (let i = 0; i < 5; i++) {
            let campsContainer = document.querySelector("#allCamps");

            let cardDiv = document.createElement("div");
            cardDiv.classList = ["card mb-3"];

            let rowDiv = document.createElement("div");
            rowDiv.classList = ["row"];

            let imageDiv = document.createElement("div");
            imageDiv.classList = ["col-md-4"];
            if (scrollCampgrounds[campCounter].images.length) {
                imageDiv.innerHTML = `<img class="img-fluid" src="${scrollCampgrounds[campCounter].images[0].url}" alt="${scrollCampgrounds[campCounter].title}" />`;
            } else {
                imageDiv.innerHTML = `<img class="img-fluid" alt="${scrollCampgrounds[campCounter].title}" src="https://res.cloudinary.com/douqbebwk/image/upload/v1600103881/YelpCamp/lz8jjv2gyynjil7lswf4.png" />`;
            }

            let bodyDiv = document.createElement("div");
            bodyDiv.classList = ["col-md-8"];

            let cardBodyDiv = document.createElement("div");
            cardBodyDiv.classList = ["card-body"];
            cardBodyDiv.innerHTML = ` <h5 class="card-title">${scrollCampgrounds[campCounter].title}</h5>  <p class="card-text">${scrollCampgrounds[campCounter].description}</p>  <p class="card-text"><small class="text-muted">${scrollCampgrounds[campCounter].location}</small>   </p> <a href="/campgrounds/${scrollCampgrounds[campCounter]._id}" class="btn btn-primary">View ${scrollCampgrounds[campCounter].title}</a>`;

            //Appending divs
            cardDiv.append(rowDiv);
            rowDiv.append(imageDiv, bodyDiv);
            bodyDiv.append(cardBodyDiv);

            campsContainer.append(cardDiv);
            campCounter++;
        }
    }
});