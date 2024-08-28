package team.bham.domain;

import java.io.Serializable;
import javax.persistence.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import team.bham.domain.enumeration.SIZE;
import team.bham.domain.enumeration.THEME;

/**
 * A UserSettings.
 */
@Entity
@Table(name = "user_settings")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserSettings implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "theme")
    private THEME theme;

    @Enumerated(EnumType.STRING)
    @Column(name = "hud")
    private SIZE hud;

    @Enumerated(EnumType.STRING)
    @Column(name = "font_size")
    private SIZE fontSize;

    @Column(name = "dyslexic_font")
    private Boolean dyslexicFont;

    @Column(name = "colour_blindness")
    private Boolean colourBlindness;

    @OneToOne
    @JoinColumn(unique = true)
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public UserSettings id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public THEME getTheme() {
        return this.theme;
    }

    public UserSettings theme(THEME theme) {
        this.setTheme(theme);
        return this;
    }

    public void setTheme(THEME theme) {
        this.theme = theme;
    }

    public SIZE getHud() {
        return this.hud;
    }

    public UserSettings hud(SIZE hud) {
        this.setHud(hud);
        return this;
    }

    public void setHud(SIZE hud) {
        this.hud = hud;
    }

    public SIZE getFontSize() {
        return this.fontSize;
    }

    public UserSettings fontSize(SIZE fontSize) {
        this.setFontSize(fontSize);
        return this;
    }

    public void setFontSize(SIZE fontSize) {
        this.fontSize = fontSize;
    }

    public Boolean getDyslexicFont() {
        return this.dyslexicFont;
    }

    public UserSettings dyslexicFont(Boolean dyslexicFont) {
        this.setDyslexicFont(dyslexicFont);
        return this;
    }

    public void setDyslexicFont(Boolean dyslexicFont) {
        this.dyslexicFont = dyslexicFont;
    }

    public Boolean getColourBlindness() {
        return this.colourBlindness;
    }

    public UserSettings colourBlindness(Boolean colourBlindness) {
        this.setColourBlindness(colourBlindness);
        return this;
    }

    public void setColourBlindness(Boolean colourBlindness) {
        this.colourBlindness = colourBlindness;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public UserSettings user(User user) {
        this.setUser(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserSettings)) {
            return false;
        }
        return id != null && id.equals(((UserSettings) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserSettings{" +
            "id=" + getId() +
            ", theme='" + getTheme() + "'" +
            ", hud='" + getHud() + "'" +
            ", fontSize='" + getFontSize() + "'" +
            ", dyslexicFont='" + getDyslexicFont() + "'" +
            ", colourBlindness='" + getColourBlindness() + "'" +
            "}";
    }
}
