package team.bham.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import team.bham.domain.Like;
import team.bham.repository.LikeRepository;
import team.bham.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link team.bham.domain.Like}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class LikeResource {

    private final Logger log = LoggerFactory.getLogger(LikeResource.class);

    private static final String ENTITY_NAME = "like";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LikeRepository likeRepository;

    public LikeResource(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    /**
     * {@code POST  /likes} : Create a new like.
     *
     * @param like the like to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new like, or with status {@code 400 (Bad Request)} if the like has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/likes")
    public ResponseEntity<Like> createLike(@RequestBody Like like) throws URISyntaxException {
        log.debug("REST request to save Like : {}", like);
        if (like.getId() != null) {
            throw new BadRequestAlertException("A new like cannot already have an ID", ENTITY_NAME, "idexists");
        }

        if (like.getEntry() == null || like.getUser() == null) {
            throw new BadRequestAlertException("Fill in all fields", ENTITY_NAME, "EmptyLike");
        }

        if (!like.getEntry().getCompetition().getOpen() || like.getEntry().getCompetition().getDueDate().isBefore(Instant.now())) {
            throw new BadRequestAlertException("Liking has closed", ENTITY_NAME, "competitionClosed");
        }

        List<Like> likes = getEntriesLike(like.getEntry().getId());
        for (int i = 0; i < likes.size(); i++) {
            System.out.println(i);
            Like temp = likes.get(i);
            if (temp.getEntry().equals(like.getEntry()) && temp.getUser().equals(like.getUser())) {
                throw new BadRequestAlertException(
                    "You are not allowed to create another like for the same entry",
                    ENTITY_NAME,
                    "duplicateLike"
                );
            }
        }

        Like result = likeRepository.save(like);
        return ResponseEntity
            .created(new URI("/api/likes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /likes/:id} : Updates an existing like.
     *
     * @param id the id of the like to save.
     * @param like the like to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated like,
     * or with status {@code 400 (Bad Request)} if the like is not valid,
     * or with status {@code 500 (Internal Server Error)} if the like couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/likes/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Like> updateLike(@PathVariable(value = "id", required = false) final Long id, @RequestBody Like like)
        throws URISyntaxException {
        log.debug("REST request to update Like : {}, {}", id, like);
        if (like.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, like.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!likeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Like result = likeRepository.save(like);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, like.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /likes/:id} : Partial updates given fields of an existing like, field will ignore if it is null
     *
     * @param id the id of the like to save.
     * @param like the like to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated like,
     * or with status {@code 400 (Bad Request)} if the like is not valid,
     * or with status {@code 404 (Not Found)} if the like is not found,
     * or with status {@code 500 (Internal Server Error)} if the like couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/likes/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Like> partialUpdateLike(@PathVariable(value = "id", required = false) final Long id, @RequestBody Like like)
        throws URISyntaxException {
        log.debug("REST request to partial update Like partially : {}, {}", id, like);
        if (like.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, like.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!likeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Like> result = likeRepository
            .findById(like.getId())
            .map(existingLike -> {
                return existingLike;
            })
            .map(likeRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, like.getId().toString())
        );
    }

    /**
     * {@code GET  /likes} : get all the likes.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of likes in body.
     */
    @GetMapping("/likes")
    public List<Like> getAllLikes(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all Likes");
        if (eagerload) {
            return likeRepository.findAllWithEagerRelationships();
        } else {
            return likeRepository.findAll();
        }
    }

    /**
     * {@code GET  /likes/:id} : get the "id" like.
     *
     * @param id the id of the like to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the like, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/likes/{id}")
    public ResponseEntity<Like> getLike(@PathVariable Long id) {
        log.debug("REST request to get Like : {}", id);
        Optional<Like> like = likeRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(like);
    }

    /**
     * {@code DELETE  /likes/:id} : delete the "id" like.
     *
     * @param id the id of the like to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/likes/{id}")
    public ResponseEntity<Void> deleteLike(@PathVariable Long id) {
        log.debug("REST request to delete Like : {}", id);
        likeRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("/likes/by-entry")
    public ResponseEntity<List<Like>> getLikesByEntryId(@RequestParam Long entryId) {
        List<Like> likes = likeRepository.findByEntryId(entryId);
        return ResponseEntity.ok().body(likes);
    }

    private List<Like> getEntriesLike(Long entryId) {
        return likeRepository.findByEntryId(entryId);
    }
}
