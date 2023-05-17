// Create Database
let db;
const request = indexedDB.open('registrationDB', 1);
request.onerror = function (event) {
    console.log('Error opening indexedDB:', event.target.errorCode);
};
request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('registration', {keyPath: 'id'});
    objectStore.createIndex('name', 'name', {unique: false});
    objectStore.createIndex('company', 'company', {unique: false});
    objectStore.createIndex('type', 'type', {unique: false});
};
request.onsuccess = function (event) {
    db = event.target.result;
    console.log('indexedDB opened successfully');
};

$(document).ready(function () {
    $("#registration-form").submit(function (event) {
        event.preventDefault();

        const invitationId = $("#invitation-id").val();
        const name = $("#name").val();
        const company = $("#company").val();
        const type = $("input[name='type']:checked").val();
        const errors = [];

        if (!invitationId) {
            errors.push('Invitation ID cannot be empty');
        } else if (!(/^\d+$/.test(invitationId))) {
            errors.push('Invitation ID must be a valid integer');
        }
        if (!name) {
            errors.push('Your name cannot be empty');
        }
        if (!company) {
            errors.push('Company name cannot be empty');
        }
        if (!type) {
            errors.push('Please select a type');
        }

        if (errors.length > 0) {
            let errorMessages = '';

            for (let i = 0; i < errors.length; i++) {
                errorMessages += errors[i] + '<br>';
            }

            $('.alert')
                .removeClass('alert-success')
                .addClass('alert-warning')
                .html(errorMessages + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                .show();
        } else {
            $('.alert')
                .removeClass('alert-warning')
                .addClass('alert-success')
                .html('Registration Info Saved' + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                .show();
            addRegistration(invitationId, name, company, type);
        }
    });

    $("#check-btn").click(function (event) {
        event.preventDefault();
        const invitationId = $("#invitation-id").val();
        const errors = [];

        if (!invitationId) {
            errors.push('Invitation ID cannot be empty');
        } else {
            if (!(/^\d+$/.test(invitationId))) {
                errors.push('Invitation ID must be a valid integer');
            }
        }

        if (errors.length > 0) {
            let errorMessages = '';

            for (let i = 0; i < errors.length; i++) {
                errorMessages += errors[i] + '<br>';
            }
            $('.alert')
                .removeClass('alert-success')
                .addClass('alert-warning')
                .html(errorMessages + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                .show();
        } else {
            const request = window.indexedDB.open('registrationDB', 1);
            request.onerror = function (event) {
                $('.alert')
                    .removeClass('alert-success')
                    .addClass('alert-warning alert-dismissible fade show')
                    .html('Database error: ' + event.target.errorCode + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                    .show();
            };

            request.onupgradeneeded = function (event) {
                const db = event.target.result;

                const objectStore = db.createObjectStore('registration', {keyPath: 'invitationId'});

                objectStore.createIndex('invitationId', 'invitationId', {unique: true});
            };

            request.onsuccess = function (event) {
                const db = event.target.result;

                const transaction = db.transaction(['registration'], 'readonly');
                const objectStore = transaction.objectStore('registration');

                const request = objectStore.get(invitationId);
                request.onerror = function (event) {
                    $('.alert')
                        .removeClass('alert-success')
                        .addClass('alert-warning alert-dismissible fade show')
                        .html('Database error: ' + event.target.errorCode + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                        .show();

                };
                request.onsuccess = function (event) {
                    const registration = event.target.result;
                    if (registration) {
                        getRegistration(invitationId);
                        $('.alert')
                            .removeClass('alert-warning')
                            .addClass('alert-success alert-dismissible fade show')
                            .html('Registration Info Found! <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                            .show();
                    } else {
                        $('.alert')
                            .removeClass('alert-success')
                            .addClass('alert-warning alert-dismissible fade show')
                            .html('Registration Info Not Found. Please enter a valid invitation ID. <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                            .show();

                    }
                };
            };
        }
    });

    $("#delete-btn").click(function (event) {
        event.preventDefault();
        const invitationId = $("#invitation-id").val();
        if (!invitationId) {
            $(".alert")
                .removeClass("alert-success")
                .addClass("alert-warning alert-dismissible fade show")
                .html("Invitation ID cannot be empty. <button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>")
                .show();

        } else if (!(/^\d+$/.test(invitationId))) {
            $(".alert")
                .removeClass("alert-success")
                .addClass("alert-warning alert-dismissible fade show")
                .html("Invitation ID must be a valid integer. <button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>")
                .show();

        } else {
            const transaction = db.transaction(['registration'], 'readonly');
            const objectStore = transaction.objectStore('registration');
            const request = objectStore.get(invitationId);

            request.onsuccess = function (event) {
                const registration = event.target.result;
                if (registration) {
                    deleteRegistration(invitationId);
                    $('.alert')
                        .removeClass('alert-warning')
                        .addClass('alert-success alert-dismissible fade show')
                        .html('Registration Info Deleted! <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                        .show();
                } else {
                    $('.alert')
                        .removeClass('alert-success')
                        .addClass('alert-warning alert-dismissible fade show')
                        .html('Registration Info Not Found. Please enter a valid invitation ID. <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                        .show();
                }
            };
        }
    });

    $(document).on("click", ".alert .close", function() {
        $(this).closest(".alert").hide();
    });
});

function addRegistration(invitationId, name, company, type) {
    const transaction = db.transaction(['registration'], 'readwrite');
    const objectStore = transaction.objectStore('registration');
    const request = objectStore.add({
        id: invitationId,
        name: name,
        company: company,
        type: type
    });
    request.onsuccess = function () {
        $(".alert")
            .removeClass("alert-warning")
            .addClass("alert-success")
            .html("Registration Info Saved." + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
            .show();
        console.log('Registration added successfully');
    };
    request.onerror = function (event) {
        $(".alert")
            .removeClass("alert-success")
            .addClass("alert-warning")
            .html("Error: Registration Info Not Saved." + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
            .show();
        console.log('Error adding registration:', event.target.errorCode);
    };
}

function getRegistration(invitationId) {
    const transaction = db.transaction(['registration'], 'readonly');
    const objectStore = transaction.objectStore('registration');
    const request = objectStore.get(invitationId);
    request.onsuccess = function () {
        if (request.result) {
            console.log('Registration found:', request.result);
            $(".alert")
                .removeClass("alert-warning")
                .addClass("alert-success")
                .html("Registration Info Found." + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                .show();
            $("#name").val(request.result.name);
            $("#company").val(request.result.company);
            $("input[name='type'][value='" + request.result.type + "']").prop('checked', true);
        } else {
            console.log('Registration not found');
            $(".alert")
                .removeClass("alert-success")
                .addClass("alert-warning")
                .html("Error: Registration Info Not Found." + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                .show();
            $("#name").val("");
            $("#company").val("");
        }
    };
    request.onerror = function (event) {
        console.log('Error getting registration:', event.target.errorCode);
        $(".alert")
            .removeClass("alert-success")
            .addClass("alert-warning")
            .html("Error: Registration Info Not Found." + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
            .show();
    };
}

function deleteRegistration(invitationId) {
    const transaction = db.transaction(['registration'], 'readwrite');
    const objectStore = transaction.objectStore('registration');
    const request = objectStore.delete(invitationId);
    request.onsuccess = function () {
        console.log('Registration deleted successfully');
        $(".alert")
            .removeClass("alert-warning")
            .addClass("alert-success")
            .html('Registration Info Deleted. <button type="button" class="close" data-dismiss="alert">&times;</button>')
            .show();
    };
    request.onerror = function (event) {
        console.log('Error deleting registration:', event.target.errorCode);
        $(".alert")
            .removeClass("alert-success")
            .addClass("alert-warning")
            .html("Error: Registration Info Not Deleted." + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
            .show();
    };
}
