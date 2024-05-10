
/*if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').then(function (registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        }).catch(error  =>{
            console.log("Reg failed!");
            console.log(error);
        });
    });
}*/

let dialog = document.querySelector('dialog');
let formid = document.querySelector("#formId");
let header = document.querySelector(".dialogHeader");
let row;  

document.querySelector('.close-button').addEventListener('click', closeDialog);

addDeleteListeners();
addAddAndEditListeners();

function addAddAndEditListeners() {
    const addEditButtons = document.querySelectorAll('.add-or-edit');
    addEditButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            studentId = parseInt(button.dataset.id);
            
            if (!studentId) {
                openAddDialog();
            } else {
                openEditDialog(event);
            }
        });
    });
}

const hamburgerIcon = document.querySelector('.hamburger-icon');
const menuItems = document.querySelector('.menu-items');
hamburgerIcon.addEventListener('click', function() {
    menuItems.classList.toggle('show');
});

document.getElementById("mainCheckbox").addEventListener("click", function() {
    let isChecked = this.checked;
    let checkboxes = document.querySelectorAll(".form-check-input");
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = isChecked;

        let icons = document.querySelectorAll(".bi.bi-circle-fill");

        icons.forEach(function(icon) {
            updateIconState(icon, isChecked);
        });
    });
});

document.querySelector('.main-element').addEventListener('click', function(event) {
    if (event.target && event.target.matches('.form-check-input')) {
        let isChecked = event.target.checked;

        let icon = event.target.closest('tr').querySelector(".bi.bi-circle-fill");
        updateIconState(icon, isChecked);
    }
});

function addDeleteListeners() {
    let deleteButtons = document.querySelectorAll(".delete-row");
    
    deleteButtons.forEach(function(button) {
        button.addEventListener("click", function(event) {
            let row = event.target.closest("tr");
            if (row) {
                row.remove();
            }
        });
    });
}

function openAddDialog() {
    header.textContent = "Add new student"; 
    formid.value = "";
    dialog.showModal();
    document.querySelector('form').reset();
}

function openEditDialog(event) {
    header.textContent = "Edit student";
    let studentId = event.target.closest("li").dataset.id;
    formid.value = studentId;
    dialog.showModal();
    document.querySelector('form').reset();
    
    row = document.querySelector(`tr[data-id="${studentId}"]`); 

    if (row) {
        let cell2 = row.cells[1];
        let cell3 = row.cells[2];
        let cell4 = row.cells[3];
        let cell5 = row.cells[4];
        
        document.querySelector("#group").value = cell2.textContent;
        document.querySelector("#name").value = cell3.textContent.split(' ')[1]; 
        document.querySelector("#surname").value = cell3.textContent.split(' ')[0]; 
        document.querySelector("#gender").value = cell4.textContent;
        
        let dateParts = cell5.textContent.split('.');
        if (dateParts.length === 3) {
            let day = parseInt(dateParts[0], 10);
            let month = parseInt(dateParts[1], 10) - 1; 
            let year = parseInt(dateParts[2], 10);

            let date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
                let formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                document.querySelector("#birthday").value = formattedDate;
            } else {
                console.error("Invalid date format:", cell5.textContent);
            }
        } else {
            console.error("Invalid date format:", cell5.textContent);
        }
    }
} 
    

function closeDialog() {
    dialog.close();
}

document.querySelector('form').addEventListener('submit', function(event) {
    validateForm();
    event.preventDefault();

    if (nameError.textContent || surnameError.textContent || birthdayError.textContent) {
        event.preventDefault();
    } else {
        
        if (formid.value === "") {
            addNewStudent();
        } else {
            editStudent(row);
        }
    }
});   

/*----------------------------------------------------------------*/

function editStudent(row) { 
    let group = document.querySelector("#group").value;
    let name = document.querySelector("#name").value;
    let surname = document.querySelector("#surname").value;
    let gender = document.querySelector("#gender").value;
    let birthday = document.querySelector("#birthday").value;
   
    if (row) {
        row.cells[1].textContent = group;
        row.cells[2].textContent = surname + ' ' + name; 
        row.cells[3].textContent = gender;
        row.cells[4].textContent = transformDateFormat(birthday);

        closeDialog();
    }
}

function addNewStudent() {
    let table = document.querySelector(".div-table table");
    let tbody = table.querySelector('tbody');

    let group = document.querySelector("#group").value;
    let name = document.querySelector("#name").value;
    let surname = document.querySelector("#surname").value;
    let gender = document.querySelector("#gender").value;
    let birthday = document.querySelector("#birthday").value;

    let data = {
        group: group,
        name: name,
        surname: surname,
        gender: gender,
        birthday: birthday
    };

    let lastStudentId = parseInt(tbody.lastElementChild.dataset.id || 0); 
    let newStudentId = lastStudentId + 1; 

    let newRow = tbody.insertRow(); 
    newRow.dataset.id = newStudentId;

    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    let cell3 = newRow.insertCell(2);
    let cell4 = newRow.insertCell(3);
    let cell5 = newRow.insertCell(4);
    let cell6 = newRow.insertCell(5);
    let cell7 = newRow.insertCell(6);

    cell1.innerHTML = '<input class="form-check-input" type="checkbox">';
    cell2.textContent = group;
    cell3.textContent = surname + ' ' + name; 
    cell4.textContent = gender;
    cell5.textContent = transformDateFormat(birthday);
    cell6.innerHTML = '<i class="bi bi-circle-fill"></i>';
    cell7.innerHTML = `<ul><li class="add-or-edit" data-id="${newStudentId}"><a href="#"><i class="bi bi-pencil-square" ></i></a></li><li><a href="#" class="delete-row"><span></span><i class="bi bi-x-square"></i></i></a></li></ul>`;

    sendDataToServer(data);
    
    closeDialog();
    addDeleteListeners();
    addAddAndEditListeners();
}

function sendDataToServer(data) {
    fetch('url', {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(data => {
        console.log('Server response:', data);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function validateForm() {
    const name = document.getElementById('name');
    const surname = document.getElementById('surname');
    const birthday = document.getElementById('birthday');

    const nameError = document.getElementById('nameError');
    const surnameError = document.getElementById('surnameError');
    const birthdayError = document.getElementById('birthdayError');

    if (name.value === '') {
        nameError.textContent = 'Please choose a name';
        nameError.style.fontSize = 'smaller'; 
        nameError.style.textAlign = 'left'; 
        nameError.style.color = 'red';
        name.style.borderColor = 'red';
    } else {
        nameError.textContent = '';
        name.style.borderColor = '';
    }

    if (surname.value === '') {
        surnameError.textContent = 'Please choose a surname';
        surnameError.style.fontSize = 'smaller'; 
        surnameError.style.textAlign = 'left'; 
        surnameError.style.color = 'red';
        surname.style.borderColor = 'red';
    } else {
        surnameError.textContent = '';
        surname.style.borderColor = '';
    }

    if (birthday.value === '') {
        birthdayError.textContent = 'Please choose a birthday';
        birthdayError.style.fontSize = 'smaller'; 
        birthdayError.style.textAlign = 'left'; 
        birthdayError.style.color = 'red';
        birthday.style.borderColor = 'red';
    } else {
        birthdayError.textContent = '';
        birthday.style.borderColor = '';
    }
}

function transformDateFormat(dateString) {
    let dateObject = new Date(dateString);

    let day = dateObject.getDate();
    let month = dateObject.getMonth() + 1;
    let year = dateObject.getFullYear();

    return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;
}

function updateIconState(icon, isChecked) {
    if (isChecked) {
        icon.classList.add("active"); 
    } else {
        icon.classList.remove("active"); 
    }
}