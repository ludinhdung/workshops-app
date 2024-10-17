import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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
  customers: {
    template: "/templates/customers.html",
    title: "Registered Customers | " + pageTitle,
    description: "View all registered customers",
  },
  bracelet: {
    template: "/templates/bracelet.html",
    title: "Bracelet Workshop | " + pageTitle,
    description: "Learn about our bracelet making workshop",
  },
  candle: {
    template: "/templates/candle.html",
    title: "Candle Making Workshop | " + pageTitle,
    description: "Explore our candle making workshop",
  },
  canvas: {
    template: "/templates/canvas.html",
    title: "Canvas Painting Workshop | " + pageTitle,
    description: "Discover our canvas painting workshop",
  },
};

const firebaseConfig = {
  apiKey: "AIzaSyDWWCb5kfeWsvNWPAwmvUCer44d12Ugw30",
  authDomain: "real-time-project-cc45a.firebaseapp.com",
  databaseURL: "https://real-time-project-cc45a-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "real-time-project-cc45a",
  storageBucket: "real-time-project-cc45a.appspot.com",
  messagingSenderId: "741778298870",
  appId: "1:741778298870:web:aa00d2dacbe9dc8bd6d9d7",
  measurementId: "G-FLYXYECFST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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

  // After loading the content, initialize Firebase and set up the booking form
  initializeFirebaseAndBookingForm();

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
  if (location === "customers") {
    console.log("Customers page loaded");
    fetchAndDisplayCustomers();
  }
};

// Watch for hash changes and call locationHandler
window.addEventListener("hashchange", locationHandler);

// Call locationHandler on page load
locationHandler();

// New function to initialize Firebase and set up the booking form
function initializeFirebaseAndBookingForm() {
  const form = document.getElementById("bookingFormData");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Get form values
      const name = document.getElementById("inputName").value;
      const email = document.getElementById("inputEmail").value;
      const phone = document.getElementById("inputPhone").value;
      const date = document.getElementById("inputDate").value;
      const cate = document.getElementById("inputCategory").value;
      const notes = document.getElementById("inputNotes").value;

      // Create a booking object
      const bookingData = {
        name,
        email,
        phone,
        date,
        category: cate,
        notes,
        timestamp: new Date().toISOString()
      };

      // Push the booking data to Firebase
      push(ref(database, 'bookings'), bookingData)
        .then(() => {
          console.log("Booking added successfully");
          // Reset the form
          form.reset();
          // Show success modal
          $("#successModal").modal("show");
        })
        .catch((error) => {
          console.error("Error adding booking: ", error);
          // Optionally, show an error message to the user
        });
    });
  }
}

function fetchAndDisplayCustomers() {
  console.log("Fetching customers...");
  const customersRef = ref(database, 'bookings');
  onValue(customersRef, (snapshot) => {
    console.log("Snapshot received:", snapshot.val());
    const data = snapshot.val();
    const customerList = document.getElementById('customerList');
    customerList.innerHTML = ''; // Clear existing content

    if (data) {
      console.log("Customer data found:", data);
      // Create table
      const table = document.createElement('table');
      table.className = 'table table-striped table-hover';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Category</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody id="customerTableBody">
        </tbody>
      `;
      customerList.appendChild(table);

      const tableBody = document.getElementById('customerTableBody');
      Object.entries(data).forEach(([key, value]) => {
        console.log("Processing customer:", value);
        const row = tableBody.insertRow();
        row.innerHTML = `
          <td>${value.name || 'N/A'}</td>
          <td>${value.email || 'N/A'}</td>
          <td>${value.phone || 'N/A'}</td>
          <td>${value.date || 'N/A'}</td>
          <td>${value.category || 'N/A'}</td>
          <td>${value.notes || 'N/A'}</td>
        `;
      });
    } else {
      console.log("No customer data found");
      customerList.innerHTML = '<p>No customers found.</p>';
    }
  });
}

export { locationHandler };
