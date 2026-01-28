"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { getTutors } from "@/api/tutorApi";
import {
  getStudentClasses,
  checkPaymentStatus,
  saveSelectedSlot,
} from "@/api/student.api";
import { getEnrollmentsStudents } from "@/api/enrollments.api";
import toast from "react-hot-toast";

const TABS = ["Upcoming", "Completed", "Cancelled", "Missed", "Pending"];
const ITEMS_PER_PAGE = 6;

const getTodayKey = () => new Date().toISOString().split("T")[0];

const isAvailableFutureSlot = (date, slot) => {
  if (!slot.isAvailable || slot.isBooked) return false;
  const now = new Date();
  const [h, m] = slot.startTime.split(":").map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(h, m, 0, 0);
  return slotDate.getTime() > now.getTime();
};

const getStatusClasses = (status) => {
  switch (status) {
    case "UPCOMING":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    case "CANCELLED":
    case "MISSED":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
    default:
      return "bg-gray-50 text-gray-700 ring-1 ring-gray-100";
  }
};

const formatStatus = (status) => {
  if (!status) return "";
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const MySessions = () => {
  const router = useRouter();
  const user = JSON.parse(localStorage.getItem("user"));

  // Slots / Tutors
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  // Enrollments (Student view)
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  /* ---------------- RESET ON TAB CHANGE ---------------- */
  useEffect(() => {
    setSessions([]);
    setPage(1);
    setSelectedSlot(null);
    setPaymentMessage("");
  }, [activeTab]);

  /* ---------------- FETCH TUTORS & AVAILABILITY ---------------- */
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const today = getTodayKey();
        const tutorRes = await getTutors();
        const tutorList = tutorRes.data?.data || [];

        const availabilityRes = await getStudentClasses();
        const availability = availabilityRes.data?.data || [];

        const mappedTutors = tutorList.map((t) => {
          const todayAvailability = availability.find(
            (a) =>
              a.tutorId?._id === t._id &&
              new Date(a.date).toISOString().split("T")[0] === today,
          );

          let date = null;
          let slots = [];
          if (todayAvailability) {
            date = todayAvailability.date;
            slots = todayAvailability.availability
              .filter((s) => isAvailableFutureSlot(todayAvailability.date, s))
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
          }

          return {
            id: t._id,
            name: t.name,
            sessions: Math.floor(Math.random() * 500) + 50,
            date,
            slots,
            img: t.avatar || `https://i.pravatar.cc/150?u=${t.email}`,
          };
        });

        setTutors(mappedTutors);
      } catch (err) {
        console.error("Tutor fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  /* ---------------- SLOT SELECTION ---------------- */
  const handleSlotSelection = async (tutorId, date, slot) => {
    if (slot.isBooked) {
      setPaymentMessage("Slot has been successfully booked.");
      return;
    }
    if (!slot.isAvailable) {
      setPaymentMessage("This slot is not available.");
      return;
    }
    try {
      setPaymentMessage("");
      const paymentRes = await checkPaymentStatus(tutorId);
      const paid = paymentRes.data?.paid;
      const status = paymentRes.data?.status;

      if (paid && status === "SUCCESS") {
        const confirmed = window.confirm(
          "Are you sure you want to book this slot?",
        );
        if (!confirmed) return;
        await saveSelectedSlot({ tutorId, date, slot });
        setSelectedSlot({ tutorId, startTime: slot.startTime });
        setPaymentMessage("Slot booked successfully!");
        return;
      }

      if (paid && status !== "SUCCESS") {
        setPaymentMessage(
          "Please wait for the payment confirmation from admin.",
        );
        return;
      }

      router.push(`/CoursesPricing?tutorId=${tutorId}&time=${slot.startTime}`);
    } catch (err) {
      console.error("Slot error:", err);
      setPaymentMessage(
        err.response?.data?.message ||
          "Something went wrong. Please try again later.",
      );
    }
  };

  /* ---------------- FETCH ENROLLMENTS ---------------- */
  useEffect(() => {
    if (!user?.id) return;

    const fetchEnrollments = async () => {
      try {
        setLoadingEnrollments(true);
        const res = await getEnrollmentsStudents({
          userId: user.id,
          status: activeTab,
        });
        console.log(res, "res");
        setEnrollments(res?.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load enrollments");
      } finally {
        setLoadingEnrollments(false);
      }
    };

    fetchEnrollments();
  }, [user?.id, activeTab]);

  /* ---------------- PAGINATION ---------------- */
  const TOTAL_PAGES = Math.max(1, Math.ceil(tutors.length / ITEMS_PER_PAGE));
  const paginatedTutors = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return tutors.slice(start, start + ITEMS_PER_PAGE);
  }, [tutors, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-10 bg-[#FBFCFF] min-h-screen pt-20 space-y-12">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black">My Sessions</h1>
          <p className="text-gray-500 font-medium">
            Manage your learning journey
          </p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-bold ${
                activeTab === tab
                  ? "bg-white text-[#6335F8] shadow"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {/* ENROLLMENTS TABLE */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Sessions</h2>
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold">{activeTab}</span>{" "}
              sessions
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {enrollments.length}{" "}
            {enrollments.length === 1 ? "session" : "sessions"}
          </div>
        </div>
        {loadingEnrollments ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading enrollments...
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No enrollments found for this tab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Tutor</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Meeting</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr
                    key={e._id}
                    className="border-t border-gray-100 transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                          {e.tutor?.name?.[0] || "T"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {e.tutor?.name}
                          </span>
                          {e.package?.title && (
                            <span className="text-xs text-gray-500">
                              {e.package.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-sm text-gray-800 line-clamp-2">
                        {e.package?.title || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-800">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {e.slot?.date
                            ? new Date(e.slot.date).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-800">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {e.slot?.startTime && e.slot?.endTime
                            ? `${e.slot.startTime} - ${e.slot.endTime}`
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {e.meetingLink ? (
                        <a
                          href={e.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          Join session
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Not available
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center justify-end gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(e.status)}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {formatStatus(e.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYMENT MESSAGE */}
      {paymentMessage && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-xl mb-6 font-semibold">
          {paymentMessage}
        </div>
      )}

      {/* TUTORS SLOTS GRID */}
      {paginatedTutors.length > 0 && (
        <div>
          <h2 className="text-xl font-black flex gap-2 mb-6">
            <LayoutGrid size={20} /> Book a Trial Session
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-white p-6 rounded-3xl border hover:shadow-xl"
              >
                <div className="flex gap-4 mb-4">
                  <img
                    src={tutor.img}
                    className="w-16 h-16 rounded-2xl"
                    alt={tutor.name}
                  />
                  <div>
                    <h4 className="font-black">{tutor.name}</h4>
                    <p className="text-xs text-gray-400 font-bold">
                      {tutor.sessions}+ Sessions
                    </p>
                  </div>
                </div>

                {/* SLOTS */}
                {tutor.slots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {tutor.slots.map((slot, i) => (
                      <button
                        key={i}
                        disabled={slot.isBooked || !slot.isAvailable}
                        onClick={() =>
                          handleSlotSelection(tutor.id, tutor.date, slot)
                        }
                        className={`px-3 py-2 text-xs rounded-lg font-bold
                          ${
                            slot.isBooked
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : selectedSlot?.tutorId === tutor.id &&
                                  selectedSlot?.startTime === slot.startTime
                                ? "bg-[#6335F8] text-white"
                                : "bg-white border border-gray-200 hover:bg-purple-50"
                          }
                        `}
                      >
                        {slot.isBooked
                          ? "Reserved"
                          : `${slot.startTime} - ${slot.endTime}`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mb-4">
                    No slots available today
                  </p>
                )}

                <button
                  disabled
                  className="w-full py-3 rounded-xl font-black bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Select a Slot
                </button>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center mt-16">
            <div className="flex bg-white p-2 rounded-2xl border shadow">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2"
              >
                <ChevronLeft />
              </button>
              <span className="px-4 font-black text-gray-500">
                Page {page} of {TOTAL_PAGES}
              </span>
              <button
                disabled={page === TOTAL_PAGES}
                onClick={() => setPage((p) => p + 1)}
                className="p-2"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;
