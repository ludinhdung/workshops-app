import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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
  dashboard: {
    template: "/templates/dashboard.html", // New template for the dashboard
    title: "Dashboard | " + pageTitle,
    description: "View and manage your bookings",
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

  if (location === "dashboard") {
    function calculateTotalPaidAmount() {
      const customersRef = ref(database, 'bookings');
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        let totalPaid = 0;

        if (data) {
          Object.values(data).forEach((booking) => {
            if (booking.isPaid) {
              totalPaid += booking.totalAmount;
            }
          });
        }

        document.getElementById("totalAmount").textContent = totalPaid + " VND"; // Cập nhật giá trị
      });
    }

    function updateWorkshopStats() {
      const customersRef = ref(database, 'bookings');
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        const workshopCounts = {
          "Candle workshop": 0,
          "Canvas Painting": 0,
          "Bracelet-making": 0,
          "Fragrant Bag": 0
        };

        if (data) {
          Object.values(data).forEach((booking) => {
            if (booking.isPaid) {
              workshopCounts[booking.category] = (workshopCounts[booking.category] || 0) + 1; // Tăng số lượng cho loại workshop tương ứng
            }
          });
        }

        const workshopStatsBody = document.getElementById('workshopStatsBody');
        workshopStatsBody.innerHTML = '';

        Object.entries(workshopCounts).forEach(([category, count]) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${category}</td>
            <td>${count}</td>
          `;
          workshopStatsBody.appendChild(row); // Thêm hàng vào bảng
        });
      });
    }

    updateWorkshopStats();

    calculateTotalPaidAmount();
  }
  if (location === "book") {

    function fetchAvailableSeats(category) {
      const seatsRef = ref(database, 'availableSeats'); // Adjust the path as necessary
      onValue(seatsRef, (snapshot) => {
        const availableSeats = snapshot.val();
        console.log("Available seats:", availableSeats);

        // Get the number of available seats for the selected category
        const seatsCount = availableSeats[category] || 0; // Default to 0 if category not found
        console.log(`Available seats for category "${category}":`, seatsCount);

        // Set the value of seatsCount to the input field
        document.getElementById("availableSeats").textContent = seatsCount;
        // You can add logic here to update the UI with the available seats count
      });
    }



    // Add event listener to the category input in the booking form
    const categoryInput = document.getElementById("inputCategory");
    if (categoryInput) {
      categoryInput.addEventListener("change", function () {
        const selectedCategory = this.value; // Get the selected category
        fetchAvailableSeats(selectedCategory); // Fetch available seats for the selected category
      });
    }

    const workshopPrices = {
      "Candle workshop": 150000,
      "Canvas Painting": 200000,
      "Bracelet-making": 100000,
      "Fragrant Bag": 120000 // Add price for Fragrant Bag if needed
    };

    // Function to calculate total amount
    function calculateTotal() {
      let total = 0;
      const selectedCategory = document.getElementById("inputCategory").value;
      const seatsCount = parseInt(document.getElementById("inputSeats").value) || 0; // Get the number of seats

      // Calculate total based on selected category
      if (selectedCategory && workshopPrices[selectedCategory]) {
        total += seatsCount * workshopPrices[selectedCategory]; // Multiply by the price of the selected workshop
      }

      return total;
    }

    document.getElementById('showTotalCheckbox').addEventListener('change', function () {
      var totalAmountContainer = document.getElementById('totalAmountContainer');
      var totalAmount = document.getElementById('totalAmount');

      if (this.checked) {
        totalAmountContainer.style.display = 'flex';
        totalAmount.textContent = calculateTotal() + " VND"; // Update total amount
      } else {
        totalAmountContainer.style.display = 'none';
      }
    });
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
      const seats = document.getElementById("inputSeats").value;


      if (parseInt(seats) > parseInt(document.getElementById("availableSeats").textContent)) {
        document.getElementById("seatsValidationMessage").style.display = "block";
        document.getElementById("seatsValidationMessage").textContent = "You have requested more seats than available. Please adjust your request.";
        return;
      }

      const workshopPrices = {
        "Candle workshop": 150000,
        "Canvas Painting": 200000,
        "Bracelet-making": 100000,
        "Fragrant Bag": 120000 
      };

      // Function to calculate total amount
      function calculateTotal() {
        let total = 0;
        const selectedCategory = document.getElementById("inputCategory").value;
        const seatsCount = parseInt(document.getElementById("inputSeats").value) || 0; // Get the number of seats

        // Calculate total based on selected category
        if (selectedCategory && workshopPrices[selectedCategory]) {
          total += seatsCount * workshopPrices[selectedCategory]; // Multiply by the price of the selected workshop
        }

        return total;
      }

      const totalAmount = calculateTotal();

      function updateAvailableSeats(category, seats) {
        const seatsRef = ref(database, 'availableSeats'); // Adjust the path as necessary

        onValue(seatsRef, (snapshot) => {
          const availableSeats = snapshot.val();
          const currentSeats = availableSeats[category] || 0;
          const newSeats = currentSeats - seats;

          console.log(`Updating available seats for category "${category}" to:`, newSeats);

          update(ref(database, 'availableSeats'), {
            [category]: newSeats
          })
            .then(() => {
              console.log("Available seats updated successfully");
            })
            .catch((error) => {
              console.error("Error updating available seats: ", error);
            });
        }, { onlyOnce: true });

      }

      // Create a booking object
      const bookingData = {
        name,
        email,
        phone,
        date,
        category: cate,
        seats,
        isPaid: false,
        totalAmount,
        notes,
        timestamp: new Date().toISOString()
      };


      // Push the booking data to Firebase
      push(ref(database, 'bookings'), bookingData)
        .then(() => {
          console.log("Booking added successfully");

          updateAvailableSeats(cate, parseInt(seats));
          // Reset the form
          document.getElementById("availableSeats").textContent = "Not Available"
          document.getElementById("seatsValidationMessage").style.display = "none";
          document.getElementById('showTotalCheckbox').checked = false;
          document.getElementById('totalAmountContainer').style.display = 'none';

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
            <th>Category</th>
            <th>Number of seats</th>
            <th>Total amount</th>
            <th>Note</th>
            <th>Action</th> <!-- New column for action -->
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
          <td>${value.category || 'N/A'}</td>
          <td>${value.seats || 'N/A'}</td>
          <td>${value.totalAmount + " VND" || 'N/A'}</td>
          <td>${value.notes || 'N/A'}</td>
          <td>
            ${value.isPaid ? 'Paid' : `<button class="btn btn-primary mark-as-paid" id="${key}">Mark as Paid</button>`} <!-- Button to mark as paid -->
          </td>
        `;
        // Add event listener to the "Mark as Paid" button
        const markAsPaidButton = row.querySelector('.mark-as-paid');
        if (markAsPaidButton) {
          markAsPaidButton.addEventListener('click', function () {
            markAsPaid(key); // Call markAsPaid with the booking ID
          });
        }
      });
    } else {
      console.log("No customer data found");
      customerList.innerHTML = '<p>No customers found.</p>';
    }
  });
}

// New function to mark a booking as paid
function markAsPaid(bookingId) {
  // Add confirmation dialog
  if (confirm("Are you sure you want to mark this booking as paid?")) {
    const bookingRef = ref(database, `bookings/${bookingId}`);

    // Attempt to update the booking status
    update(bookingRef, { isPaid: true }) // Use the update function here
      .then(() => {
        console.log("Booking marked as paid successfully");
        fetchAndDisplayCustomers(); // Refresh the customer list
      })
      .catch((error) => {
        console.error("Error marking booking as paid: ", error);
        alert("There was an error marking the booking as paid. Please try again."); // Notify the user
      });
  } else {
    console.log("Booking marking as paid was canceled.");
  }
}



export { locationHandler };


