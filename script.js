/* =====================================================
   RECALL V1.1
   Smart Revision System
===================================================== */


/* =========================
   STORAGE
========================= */

const CARD_STORAGE = "recallCardsV11";
const STATS_STORAGE = "recallStatsV11";
const THEME_STORAGE = "recallThemeV11";


let cards =
    JSON.parse(localStorage.getItem(CARD_STORAGE)) || [];


let stats =
    JSON.parse(localStorage.getItem(STATS_STORAGE)) || {
        reviewedDates: [],
        totalCorrect: 0,
        totalWrong: 0
    };


let activeFilter = "all";

let editingCardId = null;


/* =========================
   ELEMENTS
========================= */

const pages =
    document.querySelectorAll(".page");

const navItems =
    document.querySelectorAll(".nav-item");

const pageTitle =
    document.getElementById("pageTitle");

const cardModal =
    document.getElementById("cardModal");

const cardForm =
    document.getElementById("cardForm");

const questionInput =
    document.getElementById("questionInput");

const answerInput =
    document.getElementById("answerInput");

const subjectInput =
    document.getElementById("subjectInput");

const modalTitle =
    document.getElementById("modalTitle");

const saveCardButton =
    document.getElementById("saveCardButton");

const flashcardGrid =
    document.getElementById("flashcardGrid");

const searchInput =
    document.getElementById("searchInput");

const subjectFilter =
    document.getElementById("subjectFilter");

const testSubject =
    document.getElementById("testSubject");

const toast =
    document.getElementById("toast");


/* =========================
   DATE HELPERS
========================= */

function getToday() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function addDays(dateString, days) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    date.setDate(
        date.getDate() + days
    );

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function isDue(card) {

    return (
        !card.nextReview ||
        card.nextReview <= getToday()
    );

}


/* =========================
   SAVE
========================= */

function saveCards() {

    localStorage.setItem(
        CARD_STORAGE,
        JSON.stringify(cards)
    );

}


function saveStats() {

    localStorage.setItem(
        STATS_STORAGE,
        JSON.stringify(stats)
    );

}


/* =========================
   NAVIGATION
========================= */

function navigateTo(pageName) {

    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    const selectedPage =
        document.getElementById(pageName);


    if (selectedPage) {

        selectedPage.classList.add(
            "active-page"
        );

    }


    navItems.forEach(item => {

        item.classList.remove("active");

        if (
            item.dataset.page === pageName
        ) {

            item.classList.add("active");

        }

    });


    const titles = {

        dashboard: "Good to see you!",

        flashcards: "Keep learning.",

        revision: "Time to Revise",

        test: "Test Your Memory",

        subjects: "Your Subjects"

    };


    pageTitle.textContent =
        titles[pageName] || "Recall";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    renderAll();

}


navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            navigateTo(
                item.dataset.page
            );

        }
    );

});


document
    .querySelectorAll("[data-page-link]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                navigateTo(
                    button.dataset.pageLink
                );

            }
        );

    });


/* =========================
   MODAL
========================= */

function openAddModal() {

    editingCardId = null;

    modalTitle.textContent =
        "Create a card";

    saveCardButton.textContent =
        "Create Card";

    cardForm.reset();

    cardModal.classList.add("show");

    setTimeout(() => {

        questionInput.focus();

    }, 100);

}


function openEditModal(id) {

    const card =
        cards.find(
            item => item.id === id
        );


    if (!card) return;


    editingCardId = id;


    modalTitle.textContent =
        "Edit your card";

    saveCardButton.textContent =
        "Save Changes";


    questionInput.value =
        card.question;

    answerInput.value =
        card.answer;

    subjectInput.value =
        card.subject;


    cardModal.classList.add("show");

    setTimeout(() => {

        questionInput.focus();

    }, 100);

}


function closeModal() {

    cardModal.classList.remove("show");

    cardForm.reset();

    editingCardId = null;

}


document
    .getElementById("addCardButton")
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById("nextStudyButton")
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("cancelModal")
    .addEventListener(
        "click",
        closeModal
    );


cardModal.addEventListener(
    "click",
    event => {

        if (
            event.target === cardModal
        ) {

            closeModal();

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            cardModal.classList.contains("show")
        ) {

            closeModal();

        }

    }
);


/* =========================
   CREATE / EDIT CARD
========================= */

cardForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const question =
            questionInput.value.trim();

        const answer =
            answerInput.value.trim();

        const subject =
            subjectInput.value.trim();


        if (
            !question ||
            !answer ||
            !subject
        ) {

            showToast(
                "Please fill all fields."
            );

            return;

        }


        /* EDIT */

        if (editingCardId) {

            const card =
                cards.find(
                    item =>
                        item.id ===
                        editingCardId
                );


            if (card) {

                card.question =
                    question;

                card.answer =
                    answer;

                card.subject =
                    subject;

            }


            saveCards();

            closeModal();

            renderAll();

            showToast(
                "Card updated successfully."
            );

            return;

        }


        /* CREATE */

        const newCard = {

            id:
                Date.now().toString(),

            question,

            answer,

            subject,

            createdAt:
                getToday(),

            nextReview:
                getToday(),

            interval: 0,

            level: "new",

            correct: 0,

            wrong: 0,

            favorite: false,

            lastReviewed: null

        };


        cards.unshift(newCard);

        saveCards();

        closeModal();

        renderAll();

        showToast(
            "Flashcard created successfully."
        );

    }
);


/* =========================
   DELETE
========================= */

function deleteCard(id) {

    cards =
        cards.filter(
            card =>
                card.id !== id
        );


    saveCards();

    renderAll();

    showToast(
        "Flashcard deleted."
    );

}


/* =========================
   FAVORITE
========================= */

function toggleFavorite(id) {

    const card =
        cards.find(
            item => item.id === id
        );


    if (!card) return;


    card.favorite =
        !card.favorite;


    saveCards();

    renderAll();


    showToast(
        card.favorite
            ? "Added to favorites."
            : "Removed from favorites."
    );

}


/* =========================
   FILTERS
========================= */

document
    .querySelectorAll(".filter-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".filter-button"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                activeFilter =
                    button.dataset.filter;


                renderFlashcards();

            }
        );

    });


searchInput.addEventListener(
    "input",
    renderFlashcards
);


subjectFilter.addEventListener(
    "change",
    renderFlashcards
);


/* =========================
   SUBJECT OPTIONS
========================= */

function updateSubjectOptions() {

    const subjects = [
        ...new Set(
            cards
                .map(
                    card =>
                        card.subject.trim()
                )
                .filter(Boolean)
        )
    ].sort();


    const oldSubject =
        subjectFilter.value;

    const oldTestSubject =
        testSubject.value;


    subjectFilter.innerHTML = `
        <option value="all">
            All Subjects
        </option>
    `;


    testSubject.innerHTML = `
        <option value="all">
            All Subjects
        </option>
    `;


    subjects.forEach(subject => {

        const filterOption =
            document.createElement(
                "option"
            );

        filterOption.value =
            subject;

        filterOption.textContent =
            subject;

        subjectFilter.appendChild(
            filterOption
        );


        const testOption =
            document.createElement(
                "option"
            );

        testOption.value =
            subject;

        testOption.textContent =
            subject;

        testSubject.appendChild(
            testOption
        );

    });


    if (
        subjects.includes(
            oldSubject
        )
    ) {

        subjectFilter.value =
            oldSubject;

    }


    if (
        subjects.includes(
            oldTestSubject
        )
    ) {

        testSubject.value =
            oldTestSubject;

    }

}


/* =========================
   FLASHCARD FILTERING
========================= */

function getFilteredCards() {

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedSubject =
        subjectFilter.value;


    return cards.filter(card => {

        const searchMatch =

            card.question
                .toLowerCase()
                .includes(searchTerm)

            ||

            card.answer
                .toLowerCase()
                .includes(searchTerm)

            ||

            card.subject
                .toLowerCase()
                .includes(searchTerm);


        const subjectMatch =

            selectedSubject === "all"
            ||
            card.subject ===
                selectedSubject;


        let filterMatch = true;


        if (activeFilter === "due") {

            filterMatch =
                isDue(card);

        }


        if (activeFilter === "new") {

            filterMatch =
                card.level === "new";

        }


        if (activeFilter === "hard") {

            filterMatch =
                card.level === "hard";

        }


        if (activeFilter === "okay") {

            filterMatch =
                card.level === "okay";

        }


        if (activeFilter === "easy") {

            filterMatch =
                card.level === "easy";

        }


        if (activeFilter === "favorite") {

            filterMatch =
                card.favorite === true;

        }


        return (
            searchMatch &&
            subjectMatch &&
            filterMatch
        );

    });

}


/* =========================
   RENDER FLASHCARDS
========================= */

function renderFlashcards() {

    updateSubjectOptions();


    const filteredCards =
        getFilteredCards();


    document.getElementById(
        "resultsCount"
    ).textContent =

        `${filteredCards.length}
        ${filteredCards.length === 1
            ? "card"
            : "cards"}`;


    flashcardGrid.innerHTML = "";


    if (
        filteredCards.length === 0
    ) {

        flashcardGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✦
                </div>

                <h3>
                    ${
                        cards.length === 0
                            ? "Your collection is empty"
                            : "No matching cards"
                    }
                </h3>

                <p>
                    ${
                        cards.length === 0
                            ? "Create your first flashcard and start building your personal revision library."
                            : "Try changing your search or filter."
                    }
                </p>

                ${
                    cards.length === 0
                        ?
                    `
                        <button
                            class="primary-button"
                            id="emptyAddButton"
                        >
                            + Create First Card
                        </button>
                    `
                        :
                    ""
                }

            </div>

        `;


        const emptyButton =
            document.getElementById(
                "emptyAddButton"
            );


        if (emptyButton) {

            emptyButton.addEventListener(
                "click",
                openAddModal
            );

        }


        return;

    }


    filteredCards.forEach(
        (card, index) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "flashcard";


            element.dataset.id =
                card.id;


            const status =
                getStatusText(card);


            const nextReview =
                formatReviewDate(
                    card.nextReview
                );


            element.innerHTML = `

                <div class="flashcard-inner">

                    <div class="card-face card-front">

                        <div class="card-top">

                            <span class="card-number">
                                CARD
                                ${String(index + 1)
                                    .padStart(2, "0")}
                            </span>

                            <div class="card-actions">

                                <button
                                    class="favorite-button
                                    ${card.favorite
                                        ? "favorited"
                                        : ""}"
                                    data-favorite="${card.id}"
                                    title="Favorite"
                                >
                                    ${card.favorite
                                        ? "★"
                                        : "☆"}
                                </button>

                                <button
                                    class="edit-card"
                                    data-edit="${card.id}"
                                    title="Edit"
                                >
                                    ✎
                                </button>

                                <button
                                    class="delete-card"
                                    data-delete="${card.id}"
                                    title="Delete"
                                >
                                    ×
                                </button>

                            </div>

                        </div>


                        <h4>
                            ${escapeHTML(
                                card.question
                            )}
                        </h4>


                        <span class="flip-hint">
                            Click to reveal answer ↻
                        </span>


                        <div class="card-status">

                            <span
                                class="status-pill
                                status-${card.level}"
                            >
                                ${status}
                            </span>

                            <span class="next-review">
                                ${nextReview}
                            </span>

                        </div>

                    </div>


                    <div class="card-face card-back">

                        <span class="answer-label">
                            ANSWER
                        </span>

                        <p class="answer-text">
                            ${escapeHTML(
                                card.answer
                            )}
                        </p>


                        <div class="card-status">

                            <span class="subject-pill">
                                ${escapeHTML(
                                    card.subject
                                )}
                            </span>

                            <span class="next-review">
                                ${nextReview}
                            </span>

                        </div>

                    </div>

                </div>

            `;


            flashcardGrid.appendChild(
                element
            );

        }
    );

}


/* =========================
   FLASHCARD EVENTS
========================= */

flashcardGrid.addEventListener(
    "click",
    event => {

        const deleteButton =
            event.target.closest(
                "[data-delete]"
            );


        if (deleteButton) {

            event.stopPropagation();

            deleteCard(
                deleteButton.dataset.delete
            );

            return;

        }


        const editButton =
            event.target.closest(
                "[data-edit]"
            );


        if (editButton) {

            event.stopPropagation();

            openEditModal(
                editButton.dataset.edit
            );

            return;

        }


        const favoriteButton =
            event.target.closest(
                "[data-favorite]"
            );


        if (favoriteButton) {

            event.stopPropagation();

            toggleFavorite(
                favoriteButton.dataset.favorite
            );

            return;

        }


        const card =
            event.target.closest(
                ".flashcard"
            );


        if (card) {

            card.classList.toggle(
                "flipped"
            );

        }

    }
);


/* =========================
   STATUS
========================= */

function getStatusText(card) {

    if (
        !card.level ||
        card.level === "new"
    ) {

        return "New";

    }


    if (card.level === "hard") {

        return "Hard";

    }


    if (card.level === "okay") {

        return "Okay";

    }


    if (card.level === "easy") {

        return "Easy";

    }


    return "New";

}


/* =========================
   REVIEW DATE
========================= */

function formatReviewDate(dateString) {

    if (!dateString) {

        return "Ready now";

    }


    if (
        dateString <= getToday()
    ) {

        return "Due now";

    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return (
        "Review " +
        date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short"
            }
        )
    );

}


/* =========================
   REVISION
========================= */

let revisionCards = [];

let revisionIndex = 0;

let revisionSessionStats = {
    hard: 0,
    okay: 0,
    easy: 0
};


function startRevisionSession() {

    revisionCards =
        cards.filter(
            card => isDue(card)
        );


    revisionIndex = 0;


    revisionSessionStats = {
        hard: 0,
        okay: 0,
        easy: 0
    };


    renderRevision();

}


function renderRevision() {

    const dueCards =
        cards.filter(
            card => isDue(card)
        );


    document.getElementById(
        "revisionCount"
    ).textContent =
        dueCards.length;


    const area =
        document.getElementById(
            "revisionArea"
        );


    if (
        revisionCards.length === 0
    ) {

        revisionCards =
            dueCards;

    }


    if (
        revisionCards.length === 0 ||
        revisionIndex >=
            revisionCards.length
    ) {

        area.innerHTML = `

            <div class="revision-done">

                <div class="done-icon">
                    🎉
                </div>

                <h3>
                    You're all caught up!
                </h3>

                <p>
                    No cards are waiting for revision.
                    Great work keeping up.
                </p>

                <button
                    class="primary-button"
                    id="revisionAddButton"
                >
                    + Add Flashcard
                </button>

            </div>

        `;


        const addButton =
            document.getElementById(
                "revisionAddButton"
            );


        if (addButton) {

            addButton.addEventListener(
                "click",
                openAddModal
            );

        }


        return;

    }


    const card =
        revisionCards[
            revisionIndex
        ];


    area.innerHTML = `

        <div class="revision-card">

            <div class="revision-progress">
                Card
                ${revisionIndex + 1}
                of
                ${revisionCards.length}
            </div>

            <span class="revision-subject">
                ${escapeHTML(card.subject)}
            </span>

            <h3>
                ${escapeHTML(card.question)}
            </h3>


            <button
                id="showRevisionAnswer"
                class="secondary-button
                show-answer-button"
            >
                Show Answer
            </button>


            <div
                id="revisionAnswer"
                class="revision-answer
                hidden-answer"
            >

                <span>ANSWER</span>

                <p>
                    ${escapeHTML(card.answer)}
                </p>

            </div>


            <div class="rating-buttons">

                <button
                    class="rating-button rating-hard"
                    data-revision-rating="hard"
                >
                    😵 Hard
                    <br>
                    <small>
                        Tomorrow
                    </small>
                </button>

                <button
                    class="rating-button rating-okay"
                    data-revision-rating="okay"
                >
                    🙂 Okay
                    <br>
                    <small>
                        3 days
                    </small>
                </button>

                <button
                    class="rating-button rating-easy"
                    data-revision-rating="easy"
                >
                    😎 Easy
                    <br>
                    <small>
                        7 days
                    </small>
                </button>

            </div>

        </div>

    `;


    document
        .getElementById(
            "showRevisionAnswer"
        )
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "revisionAnswer"
                    )
                    .classList.remove(
                        "hidden-answer"
                    );


                document
                    .getElementById(
                        "showRevisionAnswer"
                    )
                    .classList.add(
                        "hidden"
                    );

            }
        );


    document
        .querySelectorAll(
            "[data-revision-rating]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    rateRevisionCard(
                        card.id,
                        button.dataset
                            .revisionRating
                    );

                }
            );

        });

}


function rateRevisionCard(
    id,
    rating
) {

    const card =
        cards.find(
            item => item.id === id
        );


    if (!card) return;


    let days = 1;


    if (rating === "okay") {

        days = 3;

    }


    if (rating === "easy") {

        days = 7;

    }


    card.nextReview =
        addDays(
            getToday(),
            days
        );


    card.interval =
        days;


    card.level =
        rating;


    card.lastReviewed =
        getToday();


    if (rating === "easy") {

        card.correct++;

        stats.totalCorrect++;

    }


    if (rating === "okay") {

        card.correct++;

        stats.totalCorrect++;

    }


    if (rating === "hard") {

        card.wrong++;

        stats.totalWrong++;

    }


    recordStudy();


    revisionSessionStats[
        rating
    ]++;


    saveCards();

    saveStats();


    revisionIndex++;


    if (
        revisionIndex >=
        revisionCards.length
    ) {

        renderRevisionComplete();

    } else {

        renderRevision();

    }


    renderAll();

}


/* =========================
   REVISION COMPLETE
========================= */

function renderRevisionComplete() {

    const area =
        document.getElementById(
            "revisionArea"
        );


    const total =
        revisionCards.length;


    area.innerHTML = `

        <div class="revision-done">

            <div class="done-icon">
                🎉
            </div>

            <span class="section-label">
                SESSION COMPLETE
            </span>

            <h3>
                Great revision session!
            </h3>

            <p>
                You reviewed ${total}
                ${total === 1
                    ? "card"
                    : "cards"} today.
            </p>


            <div class="session-summary">

                <span class="summary-pill">
                    😵
                    ${revisionSessionStats.hard}
                    Hard
                </span>

                <span class="summary-pill">
                    🙂
                    ${revisionSessionStats.okay}
                    Okay
                </span>

                <span class="summary-pill">
                    😎
                    ${revisionSessionStats.easy}
                    Easy
                </span>

            </div>


            <button
                class="primary-button"
                id="backDashboard"
            >
                Back to Dashboard
            </button>

        </div>

    `;


    document
        .getElementById(
            "backDashboard"
        )
        .addEventListener(
            "click",
            () => {

                navigateTo(
                    "dashboard"
                );

            }
        );

}


/* =========================
   DASHBOARD
========================= */

function renderDashboard() {

    const total =
        cards.length;


    const due =
        cards.filter(
            card => isDue(card)
        ).length;


    const mastery =
        calculateMastery();


    const streak =
        calculateStreak();


    document.getElementById(
        "totalCards"
    ).textContent =
        total;


    document.getElementById(
        "dueCards"
    ).textContent =
        due;


    document.getElementById(
        "masteryPercent"
    ).textContent =
        mastery + "%";


    document.getElementById(
        "streakCount"
    ).textContent =
        streak;


    document.getElementById(
        "dashboardStreak"
    ).textContent =
        streak;


    document.getElementById(
        "activityFill"
    ).style.width =
        Math.min(
            streak * 14,
            100
        ) + "%";


    updateStreakMessage(streak);

    renderRecentCards();

    renderNextStudy();

}


function renderNextStudy() {

    const title =
        document.getElementById(
            "nextStudyTitle"
        );


    const text =
        document.getElementById(
            "nextStudyText"
        );


    const button =
        document.getElementById(
            "nextStudyButton"
        );


    if (cards.length === 0) {

        title.textContent =
            "Start building your collection";


        text.textContent =
            "Add your first flashcard and Recall will start tracking your learning.";


        button.textContent =
            "Add Flashcard";


        button.onclick =
            openAddModal;


        return;

    }


    const dueCards =
        cards.filter(
            card => isDue(card)
        );


    if (dueCards.length > 0) {

        const recommended =
            getRecommendedCard(
                dueCards
            );


        title.textContent =
            recommended.subject;


        text.textContent =
            `${dueCards.length}
            ${dueCards.length === 1
                ? "card is"
                : "cards are"}
            ready for revision.`;

        button.textContent =
            "Start Revision →";


        button.onclick =
            () => {

                revisionCards =
                    dueCards;

                revisionIndex = 0;

                navigateTo(
                    "revision"
                );

            };


        return;

    }


    const weakest =
        getWeakestSubject();


    if (weakest) {

        title.textContent =
            weakest;


        text.textContent =
            "This subject could use a little more practice.";


        button.textContent =
            "View Subject";


        button.onclick =
            () => {

                navigateTo(
                    "subjects"
                );

            };


    }

}


/* =========================
   RECOMMENDED CARD
========================= */

function getRecommendedCard(
    dueCards
) {

    return [
        ...dueCards
    ].sort(
        (a, b) => {

            const priority = {
                hard: 1,
                new: 2,
                okay: 3,
                easy: 4
            };


            return (
                (priority[a.level] || 2) -
                (priority[b.level] || 2)
            );

        }
    )[0];

}


/* =========================
   RECENT
========================= */

function renderRecentCards() {

    const container =
        document.getElementById(
            "recentCards"
        );


    container.innerHTML = "";


    if (cards.length === 0) {

        container.innerHTML = `

            <div class="recent-card">

                <span class="recent-question">
                    No flashcards yet.
                </span>

                <span class="subject-pill">
                    Start here
                </span>

            </div>

        `;

        return;

    }


    cards.slice(0, 5)
        .forEach(card => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "recent-card";


            element.innerHTML = `

                <span class="recent-question">
                    ${escapeHTML(
                        card.question
                    )}
                </span>

                <span class="subject-pill">
                    ${escapeHTML(
                        card.subject
                    )}
                </span>

            `;


            container.appendChild(
                element
            );

        });

}


/* =========================
   MASTERY
========================= */

function calculateMastery() {

    if (cards.length === 0) {

        return 0;

    }


    let total = 0;


    cards.forEach(card => {

        if (card.level === "easy") {

            total += 100;

        } else if (
            card.level === "okay"
        ) {

            total += 65;

        } else if (
            card.level === "hard"
        ) {

            total += 30;

        }

    });


    return Math.round(
        total / cards.length
    );

}


/* =========================
   WEAK SUBJECT
========================= */

function getWeakestSubject() {

    const subjectMap = {};


    cards.forEach(card => {

        if (
            !subjectMap[card.subject]
        ) {

            subjectMap[card.subject] = [];

        }


        subjectMap[
            card.subject
        ].push(card);

    });


    let weakest = null;

    let weakestScore = Infinity;


    Object.entries(
        subjectMap
    ).forEach(
        ([subject, subjectCards]) => {

            let score = 0;


            subjectCards.forEach(
                card => {

                    if (
                        card.level ===
                        "easy"
                    ) {

                        score += 100;

                    } else if (
                        card.level ===
                        "okay"
                    ) {

                        score += 65;

                    } else if (
                        card.level ===
                        "hard"
                    ) {

                        score += 30;

                    }

                }
            );


            const average =
                score /
                subjectCards.length;


            if (
                average <
                weakestScore
            ) {

                weakestScore =
                    average;

                weakest =
                    subject;

            }

        }
    );


    return weakest;

}


/* =========================
   STREAK
========================= */

function calculateStreak() {

    if (
        !stats.reviewedDates ||
        stats.reviewedDates.length === 0
    ) {

        return 0;

    }


    const dates = [
        ...new Set(
            stats.reviewedDates
        )
    ].sort().reverse();


    const today =
        getToday();


    let checkDate =
        today;


    if (
        !dates.includes(today)
    ) {

        checkDate =
            addDays(
                today,
                -1
            );

    }


    let streak = 0;


    while (
        dates.includes(
            checkDate
        )
    ) {

        streak++;

        checkDate =
            addDays(
                checkDate,
                -1
            );

    }


    return streak;

}


function updateStreakMessage(
    streak
) {

    const message =
        document.getElementById(
            "streakMessage"
        );


    if (streak === 0) {

        message.textContent =
            "Start studying today to build your streak.";

    } else if (
        streak === 1
    ) {

        message.textContent =
            "Great start! Come back tomorrow.";

    } else if (
        streak < 7
    ) {

        message.textContent =
            "You're building a habit. Keep going!";

    } else {

        message.textContent =
            "Amazing consistency. Keep your streak alive!";

    }

}


/* =========================
   RECORD STUDY
========================= */

function recordStudy() {

    const today =
        getToday();


    if (
        !stats.reviewedDates.includes(
            today
        )
    ) {

        stats.reviewedDates.push(
            today
        );

    }

}


/* =========================
   SUBJECTS
========================= */

function renderSubjects() {

    const grid =
        document.getElementById(
            "subjectGrid"
        );


    grid.innerHTML = "";


    const subjects = {};


    cards.forEach(card => {

        if (
            !subjects[card.subject]
        ) {

            subjects[card.subject] = [];

        }


        subjects[
            card.subject
        ].push(card);

    });


    const names =
        Object.keys(
            subjects
        ).sort();


    if (names.length === 0) {

        grid.innerHTML = `

            <div class="no-subjects">

                No subjects yet.
                Create some flashcards to see
                your learning progress here.

            </div>

        `;

        return;

    }


    names.forEach(subject => {

        const subjectCards =
            subjects[subject];


        let score = 0;


        subjectCards.forEach(
            card => {

                if (
                    card.level ===
                    "easy"
                ) {

                    score += 100;

                } else if (
                    card.level ===
                    "okay"
                ) {

                    score += 65;

                } else if (
                    card.level ===
                    "hard"
                ) {

                    score += 30;

                }

            }
        );


        const mastery =
            Math.round(
                score /
                subjectCards.length
            );


        const initial =
            subject
                .charAt(0)
                .toUpperCase();


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "subject-card";


        element.innerHTML = `

            <div class="subject-card-top">

                <div>

                    <h3>
                        ${escapeHTML(
                            subject
                        )}
                    </h3>

                    <p>
                        ${subjectCards.length}
                        ${
                            subjectCards.length === 1
                                ? "flashcard"
                                : "flashcards"
                        }
                    </p>

                </div>

                <div class="subject-circle">
                    ${initial}
                </div>

            </div>


            <div class="progress-label">

                <span>
                    Mastery
                </span>

                <span>
                    ${mastery}%
                </span>

            </div>


            <div class="progress-track">

                <div
                    style="
                        width: ${mastery}%;
                    "
                ></div>

            </div>

        `;


        grid.appendChild(
            element
        );

    });

}


/* =========================
   SELF TEST
========================= */

let testCards = [];

let testIndex = 0;

let testScoreValue = 0;

let testAnswered = false;


document
    .getElementById("startTest")
    .addEventListener(
        "click",
        startTest
    );


function startTest() {

    const selectedSubject =
        testSubject.value;


    testCards =
        cards.filter(
            card =>
                selectedSubject === "all"
                ||
                card.subject ===
                    selectedSubject
        );


    if (
        testCards.length === 0
    ) {

        showToast(
            "Add some flashcards first."
        );

        return;

    }


    testCards =
        shuffleArray(
            testCards
        ).slice(
            0,
            Math.min(
                10,
                testCards.length
            )
        );


    testIndex = 0;

    testScoreValue = 0;

    testAnswered = false;


    document
        .getElementById(
            "testSetup"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "testResult"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "testArea"
        )
        .classList.remove(
            "hidden"
        );


    showTestQuestion();

}


function showTestQuestion() {

    if (
        testIndex >=
        testCards.length
    ) {

        finishTest();

        return;

    }


    const card =
        testCards[testIndex];


    document.getElementById(
        "testNumber"
    ).textContent =
        `Question
        ${testIndex + 1}
        of
        ${testCards.length}`;


    document.getElementById(
        "testScore"
    ).textContent =
        `Score: ${testScoreValue}`;


    document.getElementById(
        "testQuestion"
    ).textContent =
        card.question;


    document
        .getElementById(
            "testAnswer"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "testAnswer"
        )
        .querySelector("p")
        .textContent =
        card.answer;


    document
        .getElementById(
            "revealAnswer"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "testActions"
        )
        .classList.add(
            "hidden"
        );


    testAnswered = false;

}


/* Reveal */

document
    .getElementById(
        "revealAnswer"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "testAnswer"
                )
                .classList.remove(
                    "hidden"
                );


            document
                .getElementById(
                    "revealAnswer"
                )
                .classList.add(
                    "hidden"
                );


            document
                .getElementById(
                    "testActions"
                )
                .classList.remove(
                    "hidden"
                );

        }
    );


/* Correct */

document
    .getElementById(
        "correctAnswer"
    )
    .addEventListener(
        "click",
        () => {

            if (testAnswered)
                return;


            testAnswered = true;

            testScoreValue++;


            const card =
                testCards[
                    testIndex
                ];


            card.correct++;

            card.lastReviewed =
                getToday();


            stats.totalCorrect++;

            recordStudy();

            saveCards();

            saveStats();

            nextTestQuestion();

        }
    );


/* Wrong */

document
    .getElementById(
        "wrongAnswer"
    )
    .addEventListener(
        "click",
        () => {

            if (testAnswered)
                return;


            testAnswered = true;


            const card =
                testCards[
                    testIndex
                ];


            card.wrong++;

            card.lastReviewed =
                getToday();


            stats.totalWrong++;

            recordStudy();

            saveCards();

            saveStats();

            nextTestQuestion();

        }
    );


function nextTestQuestion() {

    testIndex++;


    setTimeout(
        () => {

            showTestQuestion();

        },
        200
    );

}


function finishTest() {

    document
        .getElementById(
            "testArea"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "testResult"
        )
        .classList.remove(
            "hidden"
        );


    const percentage =
        Math.round(
            (
                testScoreValue /
                testCards.length
            ) * 100
        );


    document.getElementById(
        "finalScore"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "resultTitle"
    ).textContent =
        getResultTitle(
            percentage
        );


    document.getElementById(
        "resultMessage"
    ).textContent =
        getResultMessage(
            percentage
        );


    renderAll();

}


function getResultTitle(score) {

    if (score >= 90)
        return "Excellent recall!";

    if (score >= 70)
        return "Great work!";

    if (score >= 50)
        return "Good attempt!";

    return "Keep practicing!";

}


function getResultMessage(score) {

    if (score >= 90) {

        return "You remembered almost everything. Your revision is paying off!";

    }


    if (score >= 70) {

        return "You're doing well. A little more revision will strengthen these topics.";

    }


    if (score >= 50) {

        return "You know some of it already. Focus on the cards you found difficult.";

    }


    return "Don't worry. Forgetting is part of learning. Review your cards and try again.";

}


document
    .getElementById(
        "restartTest"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "testResult"
                )
                .classList.add(
                    "hidden"
                );


            document
                .getElementById(
                    "testSetup"
                )
                .classList.remove(
                    "hidden"
                );

        }
    );


/* =========================
   THEME
========================= */

function setTheme(theme) {

    if (
        theme === "dark"
    ) {

        document.body.classList.add(
            "dark"
        );


        document.getElementById(
            "themeIcon"
        ).textContent =
            "☀";

    } else {

        document.body.classList.remove(
            "dark"
        );


        document.getElementById(
            "themeIcon"
        ).textContent =
            "☾";

    }


    localStorage.setItem(
        THEME_STORAGE,
        theme
    );

}


function toggleTheme() {

    const dark =
        document.body.classList.contains(
            "dark"
        );


    setTheme(
        dark
            ? "light"
            : "dark"
    );

}


document
    .getElementById(
        "themeToggle"
    )
    .addEventListener(
        "click",
        toggleTheme
    );


document
    .getElementById(
        "mobileTheme"
    )
    .addEventListener(
        "click",
        toggleTheme
    );


setTheme(
    localStorage.getItem(
        THEME_STORAGE
    ) || "light"
);


/* =========================
   HERO REVISION
========================= */

document
    .getElementById(
        "heroStartButton"
    )
    .addEventListener(
        "click",
        () => {

            const due =
                cards.filter(
                    card =>
                        isDue(card)
                );


            if (due.length === 0) {

                openAddModal();

                return;

            }


            revisionCards =
                due;

            revisionIndex = 0;

            navigateTo(
                "revision"
            );

        }
    );


/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(message) {

    toast.querySelector(
        "p"
    ).textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================
   SHUFFLE
========================= */

function shuffleArray(array) {

    const copied =
        [...array];


    for (
        let i =
            copied.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            copied[i],
            copied[j]
        ] =
        [
            copied[j],
            copied[i]
        ];

    }


    return copied;

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================
   RENDER ALL
========================= */

function renderAll() {

    renderDashboard();

    renderFlashcards();

    renderRevision();

    renderSubjects();

    updateSubjectOptions();

}


/* =========================
   INITIALIZE
========================= */

renderAll();

console.log(
    "Recall V1.1 loaded successfully."
);