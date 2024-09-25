const pageTitle = "Workshops";

// create an object that maps the url to the template, title, and description
const routes = {
  404: {
    template: "/templates/404.html",
    title: "404 | " + pageTitle,
    description: "Page not found",
  },
  "/": {
    template: "/templates/index.html",
    title: "Home | " + pageTitle,
    description: "This is the home page",
  },
  about: {
    template: "/templates/about.html",
    title: "About Us | " + pageTitle,
    description: "This is the about page",
  },
  workshop: {
    template: "/templates/workshop.html",
    title: "Menu | " + pageTitle,
    description: "This is the menu page",
  },
  book: {
    template: "/templates/book.html",
    title: "Book | " + pageTitle,
    description: "This is the booking page",
  },
};

const locationHandler = async () => {
  // get the url path, replace hash with empty string
  var location = window.location.hash.replace("#", "");

  // if the path length is 0, set it to primary page route
  if (location.length == 0) {
    location = "/";
  }

  // get the route object from the routes object
  const route = routes[location] || routes["404"];

  // get the HTML from the template
  const html = await fetch(route.template).then((response) => response.text());

  // set the content of the content div to the html
  document.getElementById("content").innerHTML = html;

  // set the title of the document to the title of the route
  document.title = route.title;

  // set the description of the document to the description of the route
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", route.description);

  // Check if the current route is the booking page, and attach the form event listener
  if (location === "book") {
    document
      .getElementById("bookingFormData")
      .addEventListener("submit", function (event) {
        event.preventDefault();

        // Get form values
        const name = document.getElementById("inputName").value;
        const email = document.getElementById("inputEmail").value;
        const phone = document.getElementById("inputPhone").value;
        const date = document.getElementById("inputDate").value;
        const cate = document.getElementById("inputCategory").value;
        const notes = document.getElementById("inputNotes").value;

        // Log values to console (or process the data)
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Phone:", phone);
        console.log("Date:", date);
        console.log("Category:", cate);
        console.log("Notes:", notes);

        // Reset the form
        document.getElementById("bookingFormData").reset();

        // Show success modal
        $("#successModal").modal("show"); // Assuming you're using Bootstrap for modal handling
      });
  }

  if (location === "/") {
    $(document).ready(function () {
      // Set an interval to change slides every 2 seconds
      setInterval(function () {
        $("#customCarousel1").carousel("next"); // Move to the next slide
      }, 4000); // Change slide every 2000 milliseconds (2 seconds)
    });
  }
  // Filter
  if (location === "workshop" || location === "/") {
    // Category filter logic for the workshop page
    document.querySelectorAll(".filters_menu li").forEach(function (filter) {
      filter.addEventListener("click", function () {
        // Remove the active class from all filter buttons
        document.querySelectorAll(".filters_menu li").forEach(function (item) {
          item.classList.remove("active");
        });

        // Add the active class to the clicked filter button
        this.classList.add("active");

        // Get the filter category from the clicked button
        const filterValue = this.getAttribute("data-filter");

        // Show or hide items based on the selected filter
        document.querySelectorAll(".grid .col-lg-4").forEach(function (item) {
          // Show all items if filter is "*", otherwise match the class
          if (
            filterValue === "*" ||
            item.classList.contains(filterValue.substring(1))
          ) {
            item.style.display = "block"; // Show the item
          } else {
            item.style.display = "none"; // Hide the item
          }
        });
      });
    });
  }
};

// Watch for hash changes and call locationHandler
window.addEventListener("hashchange", locationHandler);

// Call locationHandler on page load
locationHandler();
