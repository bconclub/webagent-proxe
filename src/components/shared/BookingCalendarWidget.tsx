'use client'

import React, { useState } from 'react';
import styles from './BookingCalendarWidget.module.css';

interface BookingCalendarWidgetProps {
  onClose?: () => void;
  onBookingComplete?: (bookingData: BookingData) => void;
}

interface BookingData {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

export function BookingCalendarWidget({ onClose, onBookingComplete }: BookingCalendarWidgetProps) {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  // Generate time slots from 12 PM to 4 PM (4 slots: 12 PM, 1 PM, 2 PM, 3 PM)
  const timeSlots = [];
  for (let hour = 12; hour <= 15; hour++) {
    const timeString = hour === 12 
      ? '12:00 PM' 
      : `${hour - 12}:00 PM`;
    timeSlots.push(timeString);
  }

  // Get days of current week
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Get days of current month
  const getMonthDays = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const handleDateClick = (date: Date) => {
    // Check if it's Sunday (0 = Sunday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) {
      return; // Don't allow Sunday selection
    }

    // Only allow future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate >= today) {
      setSelectedDate(date);
      setShowTimeSlots(true);
      setSelectedTime(null);
      setShowForm(false);
    }
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      return;
    }

    const bookingData: BookingData = {
      date: selectedDate!.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: selectedTime!,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    setShowConfirmation(true);
    
    if (onBookingComplete) {
      onBookingComplete(bookingData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentDay = currentDate.getDate();

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  if (showConfirmation) {
    return (
      <div className={styles.calendarContainer} data-view="confirmation">
        <div className={styles.confirmationContainer}>
          <div className={styles.confirmationIcon}>✓</div>
          <h2 className={styles.confirmationTitle}>Booking Confirmed!</h2>
          <p className={styles.confirmationText}>
            Your appointment is scheduled for<br />
            <strong>{selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })} at {selectedTime} - {(() => {
              // Calculate end time (1 hour after start time)
              const [time, period] = selectedTime!.split(' ');
              const [hour] = time.split(':');
              let hourNum = parseInt(hour);
              if (period === 'PM' && hourNum !== 12) hourNum += 12;
              if (period === 'AM' && hourNum === 12) hourNum = 0;
              const endHour = hourNum + 1;
              const endHour12 = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
              const endPeriod = endHour >= 12 ? 'PM' : 'AM';
              return `${endHour12}:00 ${endPeriod}`;
            })()}</strong>
          </p>
          <p className={styles.confirmationDetails}>
            We'll send a confirmation email to {formData.email}
          </p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className={styles.calendarContainer} data-view="form">
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Booking Details</h2>
          <p className={styles.formSubtitle}>
            {selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })} at {selectedTime} - {(() => {
              // Calculate end time (1 hour after start time)
              const [time, period] = selectedTime!.split(' ');
              const [hour] = time.split(':');
              let hourNum = parseInt(hour);
              if (period === 'PM' && hourNum !== 12) hourNum += 12;
              if (period === 'AM' && hourNum === 12) hourNum = 0;
              const endHour = hourNum + 1;
              const endHour12 = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
              const endPeriod = endHour >= 12 ? 'PM' : 'AM';
              return `${endHour12}:00 ${endPeriod}`;
            })()}
          </p>
          
          <form onSubmit={handleFormSubmit} className={styles.bookingForm}>
            <div className={styles.formGroup}>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Name"
              />
            </div>

            <div className={styles.formGroup}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Email"
              />
            </div>

            <div className={styles.formGroup}>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Phone Number"
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => {
                  setShowForm(false);
                  setSelectedTime(null);
                }}
              >
                Back
              </button>
              <button type="submit" className={styles.submitButton}>
                Book Now
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (showTimeSlots) {
    return (
      <div className={styles.calendarContainer} data-view="timeslots">
        <div className={styles.timeSlotsContainer}>
          <h2 className={styles.timeSlotsTitle}>
            Select a Time Slot
          </h2>
          <p className={styles.timeSlotsDate}>
            {selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          
          <div className={styles.timeSlotsGrid}>
            {timeSlots.map((time) => (
              <button
                key={time}
                className={`${styles.timeSlot} ${selectedTime === time ? styles.timeSlotSelected : ''}`}
                onClick={() => handleTimeClick(time)}
              >
                {time}
              </button>
            ))}
          </div>

          <button
            className={styles.backButton}
            onClick={() => {
              setShowTimeSlots(false);
              setSelectedDate(null);
            }}
          >
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      {onClose && (
        <button className={styles.closeButton} onClick={onClose} aria-label="Close calendar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      <div className={styles.calendarHeader}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleButton} ${view === 'weekly' ? styles.toggleActive : ''}`}
            onClick={() => setView('weekly')}
          >
            Weekly
          </button>
          <button
            className={`${styles.toggleButton} ${view === 'monthly' ? styles.toggleActive : ''}`}
            onClick={() => setView('monthly')}
          >
            Monthly
          </button>
        </div>
        <button className={styles.settingsButton} aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
          </svg>
        </button>
      </div>

      <div className={styles.calendarDateHeader}>
        <span className={styles.monthName}>{currentMonth.split(' ')[0]}</span>
        <span className={styles.dayNumber}>{currentDay}</span>
      </div>

      {view === 'weekly' ? (
        <>
          <div className={styles.navigationButtons}>
            <button onClick={() => navigateWeek('prev')} className={styles.navButton}>
              ←
            </button>
            <button onClick={() => navigateWeek('next')} className={styles.navButton}>
              →
            </button>
          </div>
          
          <div className={styles.weekDaysContainer}>
            <div className={styles.weekDaysHeader}>
              {weekDays.map((day) => (
                <div key={day.toString()} className={styles.weekDayHeader}>
                  <span className={styles.weekDayName}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className={styles.weekDayNumber}>{day.getDate()}</span>
                </div>
              ))}
            </div>
            <div className={styles.weekDaysGrid}>
              {weekDays.map((day) => {
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === day.toDateString();
                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                const isSunday = day.getDay() === 0;
                
                return (
                  <button
                    key={day.toString()}
                    className={`${styles.dateButton} ${isToday ? styles.dateToday : ''} ${isSelected ? styles.dateSelected : ''} ${isPast || isSunday ? styles.datePast : ''}`}
                    onClick={() => handleDateClick(day)}
                    disabled={isPast || isSunday}
                    title={isSunday ? 'Sundays are unavailable' : ''}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.navigationButtons}>
            <button onClick={() => navigateMonth('prev')} className={styles.navButton}>
              ←
            </button>
            <span className={styles.monthYear}>{currentMonth}</span>
            <button onClick={() => navigateMonth('next')} className={styles.navButton}>
              →
            </button>
          </div>

          <div className={styles.monthGrid}>
            <div className={styles.monthDaysHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className={styles.monthDayHeader}>{day}</div>
              ))}
            </div>
            <div className={styles.monthDaysGrid}>
              {monthDays.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === day.toDateString();
                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                const isSunday = day.getDay() === 0;
                
                return (
                  <button
                    key={index}
                    className={`${styles.monthDateButton} ${!isCurrentMonth ? styles.monthDateOther : ''} ${isToday ? styles.dateToday : ''} ${isSelected ? styles.dateSelected : ''} ${isPast || isSunday ? styles.datePast : ''}`}
                    onClick={() => handleDateClick(day)}
                    disabled={isPast || !isCurrentMonth || isSunday}
                    title={isSunday ? 'Sundays are unavailable' : ''}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

