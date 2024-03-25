document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://opensheet.elk.sh/1heSBOJfBJ5MmBYTQbQD4u4NbJsmx7PvF4-h4KbDEOV4/1';

    const getTehranDate = () => {
        const now = new Date();
        const tehranOffset = 3.5;
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const tehranTime = new Date(utc + (3600000 * tehranOffset));
        const day = tehranTime.getDate();
        const month = (tehranTime.getMonth() + 1);
        const year = tehranTime.getFullYear();
        return `${day}/${month}/${year}`;
    };

    let todaySchedule = [];
    const today = getTehranDate(); 
    const fetchAndDisplaySchedule = async () => {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const todayData = data.find(day => day.time === today);

            if (todayData) {
                processSchedule(todayData);
            } else {
                console.error('No schedule found for today');
            }
        } catch (error) {
            console.error('Error fetching work schedule:', error);
        }
    };

    const processSchedule = (data) => {
        todaySchedule = Object.entries(data).filter(([key,]) => !key.includes('time'))
                                 .sort(([a,], [b,]) => new Date(`1970/01/01 ${a}`) - new Date(`1970/01/01 ${b}`));
        displayCurrentWork();
    };

    const displayCurrentWork = () => {
        const now = new Date();
        const currentMinutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
        let currentIndex = -1;
        console.log(todaySchedule)

        for (let i = 0; i < todaySchedule.length; i++) {
            const [time] = todaySchedule[i];
            const [hours, minutes] = time.split(':').map(Number);
            const slotMinutesSinceMidnight = hours * 60 + minutes;
            if (currentMinutesSinceMidnight >= slotMinutesSinceMidnight) {
                currentIndex = i;
            } else {
                break; // Found a future slot, stop searching
            }
        }
        console.log(currentIndex)
        updateUI(currentIndex);

    };

    const updateUI = (index) => {
        const workInfo = document.getElementById('currentWork');
        const countdownDisplay = document.getElementById('countdownDisplay');

        if (index >= 0 && index < todaySchedule.length) {
            const [currentTime, currentTask] = todaySchedule[index];
            workInfo.textContent = currentTask;
            // Display countdown to next work
            const nextIndex = index + 1 < todaySchedule.length ? index + 1 : 0;
            const nextTime = todaySchedule[nextIndex] ? todaySchedule[nextIndex][0].split(':').map(Number) : [0, 0];
            const now = new Date();
            const nextWorkTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextTime[0], nextTime[1]);
            if (nextWorkTime < now) nextWorkTime.setDate(nextWorkTime.getDate() + 1);
            const countdown = Math.round((nextWorkTime - now) / 60000);
            countdownDisplay.textContent = `Next work in ${countdown} minutes`;
        } else {
            workInfo.textContent = 'No work scheduled for now.';
            countdownDisplay.textContent = '';
        }
    };

    document.getElementById('previousWork').addEventListener('click', () => {
        const currentIndex = todaySchedule.findIndex(([time,]) => document.getElementById('currentWork').textContent === time);
        if (currentIndex > 0) {
            updateUI(currentIndex - 1);
        }
    });

    document.getElementById('nextWork').addEventListener('click', () => {
        const currentIndex = todaySchedule.findIndex(([time,]) => document.getElementById('currentWork').textContent === time);
        if (currentIndex < todaySchedule.length - 1) {
            updateUI(currentIndex + 1);
        }
    });

    fetchAndDisplaySchedule();
});
