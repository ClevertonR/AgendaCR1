const scheduleForm = document.getElementById('schedule-form');
const scheduleTable = document.getElementById('schedule-table');
const scheduleBody = document.getElementById('schedule-body');
const addTimeSlotButton = document.getElementById('add-time-slot');

let schedule = JSON.parse(localStorage.getItem('schedule')) || [];
let currentTimeSlot = 0;

addTimeSlotButton.addEventListener('click', addTimeSlot);

function addTimeSlot() {
    const startTime = document.getElementById('start-time').value;
    const scheduleName = document.getElementById('schedule-name').value;

    // validate input
    if (!startTime || !scheduleName) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    // validate time is not in the past
    const currentTime = new Date();
    const inputTime = new Date();
    const [hours, minutes] = startTime.split(':');
    inputTime.setHours(hours, minutes, 0);

    if (inputTime <= currentTime) {
        alert('O horário deve ser posterior ao horário atual');
        return;
    }

    // check for overlapping time slots
    const endTime = new Date(inputTime.getTime() + 30 * 60 * 1000);
    if (schedule.some(slot => {
        const slotStartTime = new Date();
        const [slotHours, slotMinutes] = slot.time.split(':');
        slotStartTime.setHours(slotHours, slotMinutes, 0);
        const slotEndTime = new Date(slotStartTime.getTime() + 30 * 60 * 1000);
        return (inputTime < slotEndTime && endTime > slotStartTime);
    })) {
        alert('Este horário se sobrepõe a um agendamento existente');
        return;
    }

    // add new time slot to schedule
    const newTimeSlot = {
        time: startTime,
        appointment: scheduleName,
        endTime: endTime.getTime()
    };
    schedule.push(newTimeSlot);
    localStorage.setItem('schedule', JSON.stringify(schedule));

    // update schedule table
    updateScheduleTable();

    // reset form fields
    document.getElementById('start-time').value = '';
    document.getElementById('schedule-name').value = '';
}

function updateScheduleTable() {
    scheduleBody.innerHTML = '';

    const currentTime = Date.now();
    schedule = schedule.filter(slot => slot.endTime > currentTime);
    localStorage.setItem('schedule', JSON.stringify(schedule));

    schedule.forEach((timeSlot, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${timeSlot.time}</td>
            <td><input type="text" value="${timeSlot.appointment}"></td>
            <td><button onclick="deleteTimeSlot(${index})">Excluir</button></td>
        `;
        scheduleBody.appendChild(row);
    });
}

// Atualiza a página a cada 60 segundos (60000 milissegundos)
setInterval(() => {
    location.reload();
}, 60000);




function deleteTimeSlot(index) {
    schedule.splice(index, 1);
    localStorage.setItem('schedule', JSON.stringify(schedule));
    updateScheduleTable();
}

// set current time as default value for start time
function setCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('start-time').value = `${hours}:${minutes}`;
}

window.onload = function () {
    setCurrentTime();
    initializeTimer();
    updateScheduleTable();

    // Atualiza a página a cada 60 segundos
    setInterval(() => {
        location.reload();
    }, 30000);
};


function initializeTimer() {
    const display = document.querySelector('#timer');
    let endTime = localStorage.getItem('endTime');

    if (!endTime) {
        endTime = Date.now() + 30 * 60 * 1000;
        localStorage.setItem('endTime', endTime);
    }

    const remainingTime = Math.floor((endTime - Date.now()) / 1000);
    startTimer(remainingTime, display);
}

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(interval);
            localStorage.removeItem('endTime');
            schedule = schedule.filter(slot => slot.endTime > Date.now());
            localStorage.setItem('schedule', JSON.stringify(schedule));
            updateScheduleTable();
        }
    }, 1000);
}
