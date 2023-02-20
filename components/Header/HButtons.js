export default function WeekItem() {
    return (
            <div className="header-main-btns-container">
                <button type="button" className="header-btn selected-btn">
                    <span className="material-icons-outlined">timeline</span>
                    <span className="btn-text">На день</span>
                </button>
                <button type="button" className="header-btn">
                    <span className="material-icons-outlined">calendar_month</span>
                    <span className="btn-text">Весь розклад</span>
                </button>
            </div>
            )
}