import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-100 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            ULM
          </div>
          <div>
            <h1 className="font-bold text-primary">Leave Manager</h1>
            <p className="text-xs text-neutral-500">University Edition</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="/api/login"
            className="text-sm font-medium text-neutral-700 hover:text-primary"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 bg-gradient-to-br from-primary-50 to-white flex-grow">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              University Leave Management System
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              A comprehensive solution for managing student leave requests with
              real-time notifications and status tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/api/login">
                <Button size="lg" className="px-8">
                  Sign In <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80"
              alt="University campus"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-neutral-100 rounded-xl bg-white shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-icons text-primary">notifications</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Notifications</h3>
              <p className="text-neutral-600">
                Receive instant updates when your leave requests are approved,
                rejected, or when someone comments on them.
              </p>
            </div>
            <div className="p-6 border border-neutral-100 rounded-xl bg-white shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-icons text-success">dashboard</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Intuitive Dashboard</h3>
              <p className="text-neutral-600">
                Easy-to-use dashboard for tracking all your leave requests, status,
                and remaining leave balance.
              </p>
            </div>
            <div className="p-6 border border-neutral-100 rounded-xl bg-white shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-icons text-purple-600">calendar_month</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Leave Calendar</h3>
              <p className="text-neutral-600">
                Visual calendar to view your leave schedule and university holidays
                at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                alt="Student studying"
                className="rounded-xl shadow-md"
              />
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Submit Request</h3>
                  <p className="text-neutral-600">
                    Fill out the leave request form with your reason, dates, and any
                    supporting documents.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Approval Process
                  </h3>
                  <p className="text-neutral-600">
                    Administrators review your request and approve or reject it
                    based on university policies.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Get Notified
                  </h3>
                  <p className="text-neutral-600">
                    Receive real-time notifications about the status of your leave
                    request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Start Managing Your Leaves Efficiently
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Join thousands of students who are already using our system for
            hassle-free leave management.
          </p>
          <a href="/api/login">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-neutral-100"
            >
              Sign In Now
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-100 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                ULM
              </div>
              <div>
                <h2 className="font-bold text-primary">Leave Manager</h2>
                <p className="text-xs text-neutral-500">University Edition</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-neutral-500">
                University Leave Management System &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
