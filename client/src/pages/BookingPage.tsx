import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isSameDay } from "date-fns";
import { fromZonedTime, toZonedTime, format as formatTz } from "date-fns-tz";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchSlots,
  createBooking,
  clearSlots,
  fetchAvailableDates,
} from "../redux/bookingSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Calendar, Clock, CheckCircle, Globe } from "lucide-react";
import api from "../api/axios";

export default function BookingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { slots, availableDates, loading } = useAppSelector(
    (state) => state.booking,
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    note: "",
  });

  // Timezone State
  const [userTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const adminTimezone = "Asia/Kathmandu"; // Hardcoded for now, or fetch from config

  // Convert Admin Time Slot to User Local Time String
  const convertToUserTime = (slotTime: string, date: Date) => {
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      // Create date object in Admin Timezone
      const adminDate = fromZonedTime(`${dateStr} ${slotTime}`, adminTimezone);
      // Convert to User Timezone
      const userDate = toZonedTime(adminDate, userTimezone);
      // Format to readable time
      return formatTz(userDate, "h:mm a", { timeZone: userTimezone });
    } catch (e) {
      return slotTime;
    }
  };

  // OTP Verification State
  const [emailVerified, setEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    dispatch(fetchAvailableDates());
  }, [dispatch]);

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime("");
    const dateStr = format(date, "yyyy-MM-dd");
    await dispatch(fetchSlots(dateStr));
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
    // Reset verification if email changes
    setEmailVerified(false);
    setShowOtpInput(false);
    setOtp("");
    setOtpError("");
  };

  const handleSendOTP = async () => {
    if (!formData.email) return;

    setIsSendingOtp(true);
    setOtpError("");

    try {
      await api.post("/otp/send", { email: formData.email });
      setShowOtpInput(true);
    } catch (error: any) {
      setOtpError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !formData.email) return;

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      await api.post("/otp/verify", { email: formData.email, otp });
      setEmailVerified(true);
      setShowOtpInput(false);
      setOtp("");
    } catch (error: any) {
      setOtpError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    if (!emailVerified) {
      alert("Please verify your email address before booking.");
      return;
    }

    const bookingData = {
      ...formData,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
    };

    const result = await dispatch(createBooking(bookingData));
    if (result.type.includes("fulfilled")) {
      dispatch(clearSlots());
      navigate("/success");
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Book an Appointment
          </h1>
          <p className="text-gray-600">
            Select a date and time that works for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Select Date
              </CardTitle>
              <CardDescription>Choose an available date</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleDatePicker
                onDateSelect={handleDateSelect}
                minDate={today}
                availableDates={availableDates}
              />
            </CardContent>
          </Card>

          {/* Time Slots Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Select Time
              </CardTitle>
              <CardDescription>
                {selectedDate
                  ? `Available slots for ${format(selectedDate, "MMM dd, yyyy")}`
                  : "Select a date first"}
                {selectedDate && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    <span>Times shown in {userTimezone}</span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500">Loading slots...</p>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const displayTime = selectedDate
                      ? convertToUserTime(slot, selectedDate)
                      : slot;
                    return (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? "default" : "outline"}
                        onClick={() => handleTimeSelect(slot)}
                        size="sm"
                      >
                        {displayTime}
                      </Button>
                    );
                  })}
                </div>
              ) : selectedDate ? (
                <p className="text-center text-gray-500">
                  No slots available for this date
                </p>
              ) : (
                <p className="text-center text-gray-400">
                  Select a date to see available times
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        {selectedTime && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
              <CardDescription>
                Fill in your information to confirm the booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      placeholder="john@example.com"
                      disabled={emailVerified}
                      className={
                        emailVerified
                          ? "pr-10 border-green-500/50 bg-green-50"
                          : ""
                      }
                    />
                    {/* Verification Checkmark */}
                    {emailVerified && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Verify Button */}
                  {!emailVerified && formData.email && !showOtpInput && (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={isSendingOtp}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      {isSendingOtp ? (
                        <>
                          <svg
                            className="animate-spin h-3 w-3 mr-2"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Sending OTP...
                        </>
                      ) : (
                        "Verify Email"
                      )}
                    </Button>
                  )}

                  {/* OTP Input Section */}
                  {showOtpInput && (
                    <div className="mt-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <label className="text-xs font-medium text-gray-600 mb-2 block">
                        Enter the verification code sent to your email
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={isVerifyingOtp || !otp}
                          size="sm"
                        >
                          {isVerifyingOtp ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                      {otpError && (
                        <p className="text-xs text-red-500 mt-2">{otpError}</p>
                      )}
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={isSendingOtp}
                        className="text-xs text-primary hover:underline mt-2"
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}

                  {emailVerified && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Email verified
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Note (optional)
                  </label>
                  <Textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="Any additional information..."
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Confirm Booking
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Simple date picker component
function SimpleDatePicker({
  onDateSelect,
  minDate,
  availableDates,
}: {
  onDateSelect: (date: Date) => void;
  minDate: Date;
  availableDates: string[];
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevMonth}>
          ←
        </Button>
        <span className="font-medium">
          {currentMonth.toLocaleDateString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          →
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} />;
          }

          const dayStr = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, new Date());
          const isAvailable = availableDates.includes(dayStr);

          // Only disable past dates or dates not in availableDates list
          const isDisabled =
            !isAvailable || day < new Date(minDate.setHours(0, 0, 0, 0));

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && onDateSelect(day)}
              disabled={isDisabled}
              className={`
                p-2 text-sm rounded-md transition-colors
                ${isDisabled ? "text-gray-300 cursor-not-allowed bg-gray-50" : "hover:bg-primary hover:text-white cursor-pointer font-semibold"}
                ${isAvailable && !isDisabled ? "bg-green-50 text-green-700 border border-green-200" : ""}
                ${isToday && !isDisabled ? "border-2 border-primary" : ""}
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
