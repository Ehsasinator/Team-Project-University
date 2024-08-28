package team.bham.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import team.bham.domain.Entry;
import team.bham.domain.Like;
import team.bham.repository.EntryRepository;
import team.bham.repository.LikeRepository;
import team.bham.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link team.bham.domain.Entry}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class EntryResource {

    private final Logger log = LoggerFactory.getLogger(EntryResource.class);

    private static final String ENTITY_NAME = "entry";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EntryRepository entryRepository;
    private final LikeRepository likeRepository;

    public EntryResource(EntryRepository entryRepository, LikeRepository likeRepository) {
        this.entryRepository = entryRepository;
        this.likeRepository = likeRepository;
    }

    /**
     * {@code POST  /entries} : Create a new entry.
     *
     * @param entry the entry to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new entry, or with status {@code 400 (Bad Request)} if the
     *         entry has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/entries")
    public ResponseEntity<Entry> createEntry(@Valid @RequestBody Entry entry) throws URISyntaxException {
        log.debug("REST request to save Entry : {}", entry);
        if (entry.getId() != null) {
            throw new BadRequestAlertException("A new entry cannot already have an ID", ENTITY_NAME, "idexists");
        }

        if (!entry.getCompetition().getOpen() || entry.getCompetition().getDueDate().isBefore(Instant.now())) {
            throw new BadRequestAlertException("A new entry cannot be added to a closed competition", ENTITY_NAME, "competitionClosed");
        }

        List<Entry> allEntries = getEntriesByCompetitionID(entry.getCompetition().getId());

        for (int i = 0; i < allEntries.size(); i++) {
            if (allEntries.get(i).getUser().getLogin().equals(entry.getUser().getLogin())) {
                throw new BadRequestAlertException("You cannot enter a competition twice", ENTITY_NAME, "duplicate");
            }
        }

        Entry result = entryRepository.save(entry);
        return ResponseEntity
            .created(new URI("/api/entries/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /entries/:id} : Updates an existing entry.
     *
     * @param id    the id of the entry to save.
     * @param entry the entry to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated entry,
     *         or with status {@code 400 (Bad Request)} if the entry is not valid,
     *         or with status {@code 500 (Internal Server Error)} if the entry
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/entries/{id}")
    public ResponseEntity<Entry> updateEntry(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Entry entry)
        throws URISyntaxException {
        log.debug("REST request to update Entry : {}, {}", id, entry);
        if (entry.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, entry.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!entryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Entry old = getEntryByID(entry.getId());

        if (!old.getUser().getLogin().equals(entry.getUser().getLogin()) || !entry.getUser().getLogin().equals(userDetails.getUsername())) {
            throw new BadRequestAlertException("You cannot edit someone elses entry", ENTITY_NAME, "accessdenied");
        }

        if (!entry.getCompetition().getOpen() || entry.getCompetition().getDueDate().isBefore(Instant.now())) {
            throw new BadRequestAlertException("Entry cannot be edited, competition has closed", ENTITY_NAME, "competitionClosed");
        }

        List<Like> likes = likeRepository.findByEntryId(entry.getId());
        if (likes != null && likes.size() > 0) {
            for (int j = 0; j < likes.size(); j++) {
                likeRepository.delete(likes.get(j));
            }
        }

        Entry result = entryRepository.save(entry);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, entry.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /entries/:id} : Partial updates given fields of an existing
     * entry, field will ignore if it is null
     *
     * @param id    the id of the entry to save.
     * @param entry the entry to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated entry,
     *         or with status {@code 400 (Bad Request)} if the entry is not valid,
     *         or with status {@code 404 (Not Found)} if the entry is not found,
     *         or with status {@code 500 (Internal Server Error)} if the entry
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/entries/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Entry> partialUpdateEntry(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Entry entry
    ) throws URISyntaxException {
        log.debug("REST request to partial update Entry partially : {}, {}", id, entry);
        if (entry.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, entry.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!entryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Entry old = getEntryByID(entry.getId());

        if (!old.getUser().getLogin().equals(entry.getUser().getLogin()) || !entry.getUser().getLogin().equals(userDetails.getUsername())) {
            throw new BadRequestAlertException("You cannot edit someone elses entry", ENTITY_NAME, "accessdenied");
        }

        if (!entry.getCompetition().getOpen() || entry.getCompetition().getDueDate().isBefore(Instant.now())) {
            throw new BadRequestAlertException("Entry cannot be edited, competition has closed", ENTITY_NAME, "competitionClosed");
        }

        List<Like> likes = likeRepository.findByEntryId(entry.getId());
        if (likes != null && likes.size() > 0) {
            for (int j = 0; j < likes.size(); j++) {
                likeRepository.delete(likes.get(j));
            }
        }

        Optional<Entry> result = entryRepository
            .findById(entry.getId())
            .map(existingEntry -> {
                if (entry.getSubmission() != null) {
                    existingEntry.setSubmission(entry.getSubmission());
                }
                if (entry.getSubmissionContentType() != null) {
                    existingEntry.setSubmissionContentType(entry.getSubmissionContentType());
                }
                if (entry.getDate() != null) {
                    existingEntry.setDate(entry.getDate());
                }

                return existingEntry;
            })
            .map(entryRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, entry.getId().toString())
        );
    }

    /**
     * {@code GET  /entries} : get all the entries.
     *
     * @param eagerload flag to eager load entities from relationships (This is
     *                  applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of entries in body.
     */
    @GetMapping("/entries")
    public List<Entry> getAllEntries(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all Entries");
        return entryRepository.findByUserIsCurrentUser();
    }

    /**
     * {@code GET  /entries/:id} : get the "id" entry.
     *
     * @param id the id of the entry to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the entry, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/entries/{id}")
    public ResponseEntity<Entry> getEntry(@PathVariable Long id) {
        log.debug("REST request to get Entry : {}", id);
        Optional<Entry> entry = entryRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(entry);
    }

    /**
     * {@code DELETE  /entries/:id} : delete the "id" entry.
     *
     * @param id the id of the entry to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/entries/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        log.debug("REST request to delete Entry : {}", id);
        entryRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("/entries/by-competition")
    public ResponseEntity<List<Entry>> getEntriesByCompetitionId(@RequestParam Long competitionId) {
        List<Entry> entries = entryRepository.findByCompetitionId(competitionId);
        return ResponseEntity.ok().body(entries);
    }

    private Entry getEntryByID(Long id) {
        Optional<Entry> entry = entryRepository.findOneWithEagerRelationships(id);
        return entry.orElse(null);
    }

    private List<Entry> getEntriesByCompetitionID(Long competitionId) {
        List<Entry> entries = entryRepository.findByCompetitionId(competitionId);
        return entries;
    }

    @GetMapping("/entries/by-user")
    public List<Entry> getEntriesByUser(String username) {
        List<Entry> entries = entryRepository.findAll();
        List<Entry> result = new ArrayList<>();

        for (int i = 0; i < entries.size(); i++) {
            if (entries.get(i).getUser().getLogin().equals(username)) result.add(entries.get(i));
        }

        return result;
    }
}
