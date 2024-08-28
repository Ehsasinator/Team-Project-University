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
 * A Competition.
 */
@Entity
@Table(name = "competition")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Competition implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "due_date")
    private Instant dueDate;

    @NotNull
    @Column(name = "word", nullable = false)
    private String word;

    @Column(name = "open")
    private Boolean open;

    @OneToMany(mappedBy = "competition")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "competition", "user", "likes", "comments", "reports" }, allowSetters = true)
    private Set<Entry> entries = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Competition id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getDueDate() {
        return this.dueDate;
    }

    public Competition dueDate(Instant dueDate) {
        this.setDueDate(dueDate);
        return this;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public String getWord() {
        return this.word;
    }

    public Competition word(String word) {
        this.setWord(word);
        return this;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public Boolean getOpen() {
        return this.open;
    }

    public Competition open(Boolean open) {
        this.setOpen(open);
        return this;
    }

    public void setOpen(Boolean open) {
        this.open = open;
    }

    public Set<Entry> getEntries() {
        return this.entries;
    }

    public void setEntries(Set<Entry> entries) {
        if (this.entries != null) {
            this.entries.forEach(i -> i.setCompetition(null));
        }
        if (entries != null) {
            entries.forEach(i -> i.setCompetition(this));
        }
        this.entries = entries;
    }

    public Competition entries(Set<Entry> entries) {
        this.setEntries(entries);
        return this;
    }

    public Competition addEntries(Entry entry) {
        this.entries.add(entry);
        entry.setCompetition(this);
        return this;
    }

    public Competition removeEntries(Entry entry) {
        this.entries.remove(entry);
        entry.setCompetition(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Competition)) {
            return false;
        }
        return id != null && id.equals(((Competition) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Competition{" +
            "id=" + getId() +
            ", dueDate='" + getDueDate() + "'" +
            ", word='" + getWord() + "'" +
            ", open='" + getOpen() + "'" +
            "}";
    }
}
