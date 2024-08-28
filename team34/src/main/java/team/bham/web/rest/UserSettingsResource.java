package team.bham.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import team.bham.domain.UserSettings;
import team.bham.repository.UserSettingsRepository;
import team.bham.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link team.bham.domain.UserSettings}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class UserSettingsResource {

    private final Logger log = LoggerFactory.getLogger(UserSettingsResource.class);

    private static final String ENTITY_NAME = "userSettings";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserSettingsRepository userSettingsRepository;

    public UserSettingsResource(UserSettingsRepository userSettingsRepository) {
        this.userSettingsRepository = userSettingsRepository;
    }

    /**
     * {@code POST  /user-settings} : Create a new userSettings.
     *
     * @param userSettings the userSettings to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new userSettings, or with status {@code 400 (Bad Request)} if the userSettings has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/user-settings")
    public ResponseEntity<UserSettings> createUserSettings(@RequestBody UserSettings userSettings) throws URISyntaxException {
        log.debug("REST request to save UserSettings : {}", userSettings);
        if (userSettings.getId() != null) {
            throw new BadRequestAlertException("A new userSettings cannot already have an ID", ENTITY_NAME, "idexists");
        }
        UserSettings result = userSettingsRepository.save(userSettings);
        return ResponseEntity
            .created(new URI("/api/user-settings/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /user-settings/:id} : Updates an existing userSettings.
     *
     * @param id the id of the userSettings to save.
     * @param userSettings the userSettings to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userSettings,
     * or with status {@code 400 (Bad Request)} if the userSettings is not valid,
     * or with status {@code 500 (Internal Server Error)} if the userSettings couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/user-settings/{id}")
    public ResponseEntity<UserSettings> updateUserSettings(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody UserSettings userSettings
    ) throws URISyntaxException {
        log.debug("REST request to update UserSettings : {}, {}", id, userSettings);
        if (userSettings.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userSettings.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userSettingsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        UserSettings result = userSettingsRepository.save(userSettings);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, userSettings.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /user-settings/:id} : Partial updates given fields of an existing userSettings, field will ignore if it is null
     *
     * @param id the id of the userSettings to save.
     * @param userSettings the userSettings to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userSettings,
     * or with status {@code 400 (Bad Request)} if the userSettings is not valid,
     * or with status {@code 404 (Not Found)} if the userSettings is not found,
     * or with status {@code 500 (Internal Server Error)} if the userSettings couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/user-settings/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<UserSettings> partialUpdateUserSettings(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody UserSettings userSettings
    ) throws URISyntaxException {
        log.debug("REST request to partial update UserSettings partially : {}, {}", id, userSettings);
        if (userSettings.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userSettings.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userSettingsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<UserSettings> result = userSettingsRepository
            .findById(userSettings.getId())
            .map(existingUserSettings -> {
                if (userSettings.getTheme() != null) {
                    existingUserSettings.setTheme(userSettings.getTheme());
                }
                if (userSettings.getHud() != null) {
                    existingUserSettings.setHud(userSettings.getHud());
                }
                if (userSettings.getFontSize() != null) {
                    existingUserSettings.setFontSize(userSettings.getFontSize());
                }
                if (userSettings.getDyslexicFont() != null) {
                    existingUserSettings.setDyslexicFont(userSettings.getDyslexicFont());
                }
                if (userSettings.getColourBlindness() != null) {
                    existingUserSettings.setColourBlindness(userSettings.getColourBlindness());
                }

                return existingUserSettings;
            })
            .map(userSettingsRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, userSettings.getId().toString())
        );
    }

    /**
     * {@code GET  /user-settings} : get all the userSettings.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of userSettings in body.
     */
    @GetMapping("/user-settings")
    public List<UserSettings> getAllUserSettings(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all UserSettings");
        if (eagerload) {
            return userSettingsRepository.findAllWithEagerRelationships();
        } else {
            return userSettingsRepository.findAll();
        }
    }

    /**
     * {@code GET  /user-settings/:id} : get the "id" userSettings.
     *
     * @param id the id of the userSettings to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userSettings, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/user-settings/{id}")
    public ResponseEntity<UserSettings> getUserSettings(@PathVariable Long id) {
        log.debug("REST request to get UserSettings : {}", id);
        Optional<UserSettings> userSettings = userSettingsRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(userSettings);
    }

    /**
     * {@code GET  /user-settings/user/:id} : get the user "id" userSettings.
     *
     * @param id the id of the userSettings user to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userSettings, or with status {@code 404 (Not Found)}.
     */
    /*@GetMapping("/user-settings/user/{login}")
    public ResponseEntity<UserSettings> getUserSettingsUser(@PathVariable String login) {
        log.debug("REST request to get UserSettings : {}", login);
        Optional<UserSettings> userSettings = userSettingsRepository.findOneWithToOneRelationshipsUser(login);
        return ResponseUtil.wrapOrNotFound(userSettings);
    }*/

    /**
     * {@code DELETE  /user-settings/:id} : delete the "id" userSettings.
     *
     * @param id the id of the userSettings to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/user-settings/{id}")
    public ResponseEntity<Void> deleteUserSettings(@PathVariable Long id) {
        log.debug("REST request to delete UserSettings : {}", id);
        userSettingsRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
