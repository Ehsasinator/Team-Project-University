package team.bham.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Entry.
 */
@Entity
@Table(name = "entry")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Entry implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Lob
    @Column(name = "submission", nullable = false)
    private byte[] submission;

    @NotNull
    @Column(name = "submission_content_type", nullable = false)
    private String submissionContentType;

    @Column(name = "date")
    private Instant date;

    @ManyToOne
    @JsonIgnoreProperties(value = { "entries" }, allowSetters = true)
    private Competition competition;

    @ManyToOne
    private User user;

    @OneToMany(mappedBy = "entry")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "entry", "user" }, allowSetters = true)
    private Set<Like> likes = new HashSet<>();

    @OneToMany(mappedBy = "entry")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "entry", "user" }, allowSetters = true)
    private Set<Comment> comments = new HashSet<>();

    @OneToMany(mappedBy = "entry")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "user", "entry" }, allowSetters = true)
    private Set<Report> reports = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Entry id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getSubmission() {
        return this.submission;
    }

    public Entry submission(byte[] submission) {
        this.setSubmission(submission);
        return this;
    }

    public void setSubmission(byte[] submission) {
        this.submission = submission;
    }

    public String getSubmissionContentType() {
        return this.submissionContentType;
    }

    public Entry submissionContentType(String submissionContentType) {
        this.submissionContentType = submissionContentType;
        return this;
    }

    public void setSubmissionContentType(String submissionContentType) {
        this.submissionContentType = submissionContentType;
    }

    public Instant getDate() {
        return this.date;
    }

    public Entry date(Instant date) {
        this.setDate(date);
        return this;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Competition getCompetition() {
        return this.competition;
    }

    public void setCompetition(Competition competition) {
        this.competition = competition;
    }

    public Entry competition(Competition competition) {
        this.setCompetition(competition);
        return this;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Entry user(User user) {
        this.setUser(user);
        return this;
    }

    public Set<Like> getLikes() {
        return this.likes;
    }

    public void setLikes(Set<Like> likes) {
        if (this.likes != null) {
            this.likes.forEach(i -> i.setEntry(null));
        }
        if (likes != null) {
            likes.forEach(i -> i.setEntry(this));
        }
        this.likes = likes;
    }

    public Entry likes(Set<Like> likes) {
        this.setLikes(likes);
        return this;
    }

    public Entry addLike(Like like) {
        this.likes.add(like);
        like.setEntry(this);
        return this;
    }

    public Entry removeLike(Like like) {
        this.likes.remove(like);
        like.setEntry(null);
        return this;
    }

    public Set<Comment> getComments() {
        return this.comments;
    }

    public void setComments(Set<Comment> comments) {
        if (this.comments != null) {
            this.comments.forEach(i -> i.setEntry(null));
        }
        if (comments != null) {
            comments.forEach(i -> i.setEntry(this));
        }
        this.comments = comments;
    }

    public Entry comments(Set<Comment> comments) {
        this.setComments(comments);
        return this;
    }

    public Entry addComments(Comment comment) {
        this.comments.add(comment);
        comment.setEntry(this);
        return this;
    }

    public Entry removeComments(Comment comment) {
        this.comments.remove(comment);
        comment.setEntry(null);
        return this;
    }

    public Set<Report> getReports() {
        return this.reports;
    }

    public void setReports(Set<Report> reports) {
        if (this.reports != null) {
            this.reports.forEach(i -> i.setEntry(null));
        }
        if (reports != null) {
            reports.forEach(i -> i.setEntry(this));
        }
        this.reports = reports;
    }

    public Entry reports(Set<Report> reports) {
        this.setReports(reports);
        return this;
    }

    public Entry addReport(Report report) {
        this.reports.add(report);
        report.setEntry(this);
        return this;
    }

    public Entry removeReport(Report report) {
        this.reports.remove(report);
        report.setEntry(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Entry)) {
            return false;
        }
        return id != null && id.equals(((Entry) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Entry{" +
            "id=" + getId() +
            ", submission='" + getSubmission() + "'" +
            ", submissionContentType='" + getSubmissionContentType() + "'" +
            ", date='" + getDate() + "'" +
            "}";
    }
}
