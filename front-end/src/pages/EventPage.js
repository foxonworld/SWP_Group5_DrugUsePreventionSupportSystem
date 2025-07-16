"use client"

import { useState, useEffect } from "react"
import "../styles/EventPage.css"
import Footer from "../components/Footer" // Import the new Footer component
import { eventData} from "../service/api";
import { useNavigate } from "react-router-dom";

const EventPage = ({ navigateTo }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([])
  const [user, setUser] = useState(null) // State for current user
  const [selectedType, setSelectedType] = useState("all")
  const [loading, setLoading] = useState(true)

   useEffect(() => {
    // Lấy user từ localStorage (nếu cần)
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Lấy danh sách sự kiện từ API
    const fetchEvents = async () => {
      setLoading(true);
      const data = await eventData();
      setEvents(Array.isArray(data) ? data : data.events || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);


  const eventTypes = ["all", "Awareness", "Education", "Support"]

  const filteredEvents = selectedType === "all" ? events : events.filter((event) => event.type === selectedType)

  const handleJoinEvent = async (eventId) => {
    if (!user) {
      alert("Please login to join events")
      // navigateTo('login'); // Example: redirect to login page
      return
    }

    try {
      const response = await fetch("/api/events/participate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_id: user.account_id,
          event_id: eventId,
          status: "joined",
          feedback: "Looking forward to it.", // Default feedback
        }),
      })

      if (response.ok) {
        alert("Successfully joined the event!")
        // Optionally update UI to show user has joined
      } else {
        const errorData = await response.json()
        alert(`Failed to join event: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error joining event:", error)
      alert("An error occurred while joining the event.")
    }
  }

const handleShareExperience = (eventId) => {
  navigate(`/blogs?event=${eventId}`);
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "Awareness":
        return "type-awareness"
      case "Education":
        return "type-education"
      case "Support":
        return "type-support"
      default:
        return "type-default"
    }
  }

  if (loading) {
    return (
      <div className="eventpage">
        <div className="loading-container">
          <div className="loading-text">Loading events...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="eventpage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Join Our Community Events</h1>
          <p>
            Connect with others, share experiences, and build a stronger community together in the fight against drug
            addiction.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => document.getElementById("events-section").scrollIntoView()}>
              Browse Events
            </button>
            <button className="btn-secondary" onClick={() => navigateTo && navigateTo("blogs")}>
              Share Experience
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/event-blogs.png" alt="Community Events" />
        </div>
      </section>

      {/* Event Categories Section */}
      <section className="overview-section">
        <div className="container">
          <h2>Event Categories</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon">🎯</div>
              <h3>Awareness Events</h3>
              <p>Community outreach programs to raise awareness about drug prevention and healthy living.</p>
              <button className="overview-link" onClick={() => setSelectedType("Awareness")}>
                View Events
              </button>
            </div>
            <div className="overview-card">
              <div className="overview-icon">📚</div>
              <h3>Educational Workshops</h3>
              <p>Interactive learning sessions for youth, parents, and professionals about prevention strategies.</p>
              <button className="overview-link" onClick={() => setSelectedType("Education")}>
                Join Workshops
              </button>
            </div>
            <div className="overview-card">
              <div className="overview-icon">🤝</div>
              <h3>Support Groups</h3>
              <p>Safe spaces for individuals and families to share experiences and receive mutual support.</p>
              <button className="overview-link" onClick={() => setSelectedType("Support")}>
                Find Support
              </button>
            </div>
            <div className="overview-card">
              <div className="overview-icon">✍️</div>
              <h3>Share Stories</h3>
              <p>Share your journey and experiences to inspire and help others in the community.</p>
              <button className="overview-link" onClick={() => navigateTo && navigateTo("blogs")}>
                Read Stories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Event Filter Section */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-tabs">
            {eventTypes.map((type) => (
              <button
                key={type}
                className={`filter-tab ${selectedType === type ? "active" : ""}`}
                onClick={() => setSelectedType(type)}
              >
                {type === "all" ? "All Events" : type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events List Section */}
      <section id="events-section" className="events-section">
        <div className="container">
          <h2>Upcoming Events</h2>
          {filteredEvents.length === 0 ? (
            <div className="no-events">
              <p>No events found for the selected category.</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <div key={event.event_id} className="event-card">
                  <div className="event-header">
                    <span className={`event-type ${getTypeColor(event.type)}`}>{event.type}</span>
                    <div className="participant-count">
                      <span className="participant-icon">👥</span>
                      {event.participantCount}
                    </div>
                  </div>
                  <h3 className="event-title">{event.name}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <div className="event-detail">
                      <span className="detail-icon">📅</span>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="event-detail">
                      <span className="detail-icon">📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="event-actions">
                    <button className="btn-primary event-btn" onClick={() => handleJoinEvent(event.event_id)}>
                      Join Event
                    </button>
                    <button className="btn-outline event-btn" onClick={() => handleShareExperience(event.event_id)}>
                      Share Experience
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Join Our Events?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Expert Guidance</h3>
              <p>Learn from certified professionals and experienced counselors in drug prevention</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community Support</h3>
              <p>Connect with like-minded individuals who share your commitment to a drug-free lifestyle</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Personal Growth</h3>
              <p>Develop skills and knowledge to help yourself and others in prevention and recovery</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Share & Learn</h3>
              <p>Share your experiences through blogs and learn from others' journeys</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Make a Difference?</h2>
          <p>
            Join our community events and be part of the solution. Together, we can build a stronger, drug-free
            community.
          </p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={() => setSelectedType("all")}>
              View All Events
            </button>
            <button className="btn-outline" onClick={() => navigateTo && navigateTo("blogs")}>
              Share Your Story
            </button>
          </div>
        </div>
      </section>

      <Footer navigateTo={navigateTo} />
    </div>
  )
}

export default EventPage
