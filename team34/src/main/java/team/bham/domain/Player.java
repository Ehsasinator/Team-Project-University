package team.bham.domain;

import java.io.Serializable;
import javax.persistence.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Player.
 */
@Entity
@Table(name = "player")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Player implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Lob
    @Column(name = "player_icon")
    private byte[] playerIcon;

    @Column(name = "player_icon_content_type")
    private String playerIconContentType;

    @OneToOne
    @JoinColumn(unique = true)
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Player id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getPlayerIcon() {
        return this.playerIcon;
    }

    public Player playerIcon(byte[] playerIcon) {
        this.setPlayerIcon(playerIcon);
        return this;
    }

    public void setPlayerIcon(byte[] playerIcon) {
        this.playerIcon = playerIcon;
    }

    public String getPlayerIconContentType() {
        return this.playerIconContentType;
    }

    public Player playerIconContentType(String playerIconContentType) {
        this.playerIconContentType = playerIconContentType;
        return this;
    }

    public void setPlayerIconContentType(String playerIconContentType) {
        this.playerIconContentType = playerIconContentType;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Player user(User user) {
        this.setUser(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Player)) {
            return false;
        }
        return id != null && id.equals(((Player) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Player{" +
            "id=" + getId() +
            ", playerIcon='" + getPlayerIcon() + "'" +
            ", playerIconContentType='" + getPlayerIconContentType() + "'" +
            "}";
    }
}
