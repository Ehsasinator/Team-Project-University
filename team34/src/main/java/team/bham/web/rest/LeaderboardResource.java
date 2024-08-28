package team.bham.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Comparator;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import team.bham.domain.Leaderboard;
import team.bham.repository.LeaderboardRepository;
import team.bham.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link team.bham.domain.Leaderboard}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class LeaderboardResource {

    private final Logger log = LoggerFactory.getLogger(LeaderboardResource.class);

    private static final String ENTITY_NAME = "leaderboard";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LeaderboardRepository leaderboardRepository;

    public LeaderboardResource(LeaderboardRepository leaderboardRepository) {
        this.leaderboardRepository = leaderboardRepository;
    }

    /**
     * {@code POST  /leaderboards} : Create a new leaderboard.
     *
     * @param leaderboard the leaderboard to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new leaderboard, or with status {@code 400 (Bad Request)} if the leaderboard has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */

    @PostMapping("/leaderboards")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Leaderboard> createLeaderboard(@Valid @RequestBody Leaderboard leaderboard) throws URISyntaxException {
        log.debug("REST request to save Leaderboard : {}", leaderboard);
        if (leaderboard.getId() != null) {
            throw new BadRequestAlertException("A new leaderboard cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Leaderboard result = leaderboardRepository.save(leaderboard);
        return ResponseEntity
            .created(new URI("/api/leaderboards/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /leaderboards/:id} : Updates an existing leaderboard.
     *
     * @param id the id of the leaderboard to save.
     * @param leaderboard the leaderboard to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated leaderboard,
     * or with status {@code 400 (Bad Request)} if the leaderboard is not valid,
     * or with status {@code 500 (Internal Server Error)} if the leaderboard couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */

    @PutMapping("/leaderboards/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Leaderboard> updateLeaderboard(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Leaderboard leaderboard
    ) throws URISyntaxException {
        log.debug("REST request to update Leaderboard : {}, {}", id, leaderboard);
        if (leaderboard.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, leaderboard.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!leaderboardRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Leaderboard result = leaderboardRepository.save(leaderboard);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, leaderboard.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /leaderboards/:id} : Partial updates given fields of an existing leaderboard, field will ignore if it is null
     *
     * @param id the id of the leaderboard to save.
     * @param leaderboard the leaderboard to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated leaderboard,
     * or with status {@code 400 (Bad Request)} if the leaderboard is not valid,
     * or with status {@code 404 (Not Found)} if the leaderboard is not found,
     * or with status {@code 500 (Internal Server Error)} if the leaderboard couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */

    @PatchMapping(value = "/leaderboards/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Leaderboard> partialUpdateLeaderboard(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Leaderboard leaderboard
    ) throws URISyntaxException {
        log.debug("REST request to partial update Leaderboard partially : {}, {}", id, leaderboard);
        if (leaderboard.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, leaderboard.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!leaderboardRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Leaderboard> result = leaderboardRepository
            .findById(leaderboard.getId())
            .map(existingLeaderboard -> {
                if (leaderboard.getScore() != null) {
                    existingLeaderboard.setScore(leaderboard.getScore());
                }
                if (leaderboard.getRank() != null) {
                    existingLeaderboard.setRank(leaderboard.getRank());
                }

                return existingLeaderboard;
            })
            .map(leaderboardRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, leaderboard.getId().toString())
        );
    }

    /**
     * {@code GET  /leaderboards} : get all the leaderboards.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of leaderboards in body.
     */

    @GetMapping("/leaderboards")
    public List<Leaderboard> getAllLeaderboards(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all Leaderboards");
        List<Leaderboard> leaderboards;

        if (eagerload) {
            leaderboards = leaderboardRepository.findAllWithEagerRelationships();
        } else {
            leaderboards = leaderboardRepository.findAll();
        }

        leaderboards.sort(Comparator.comparing(Leaderboard::getScore).reversed());

        for (int i = 0; i < leaderboards.size(); i++) {
            leaderboards.get(i).setRank(i + 1);
        }
        return leaderboards;
    }

    // @GetMapping("/leaderboards")
    // public List<Leaderboard> getAllLeaderboards(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
    //     log.debug("REST request to get all Leaderboards");
    //     List<Leaderboard> leaderboards = leaderboardRepository.findAll();
    //     // Sort the array according to the score
    //     // Then set the rank
    //     // For example, for number 1 it will be: leaderboards.get(0).setRank(1);
    //     // Use a for loop
    //     // if (eagerload) {
    //     //     return leaderboardRepository.findAllWithEagerRelationships();
    //     // } else {
    //     //     return leaderboardRepository.findAll();
    //     // }
    // }

    /**
     * {@code GET  /leaderboards/:id} : get the "id" leaderboard.
     *
     * @param id the id of the leaderboard to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the leaderboard, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/leaderboards/{id}")
    public ResponseEntity<Leaderboard> getLeaderboard(@PathVariable Long id) {
        log.debug("REST request to get Leaderboard : {}", id);
        Optional<Leaderboard> leaderboard = leaderboardRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(leaderboard);
    }

    /**
     * {@code DELETE  /leaderboards/:id} : delete the "id" leaderboard.
     *
     * @param id the id of the leaderboard to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */

    @DeleteMapping("/leaderboards/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteLeaderboard(@PathVariable Long id) {
        log.debug("REST request to delete Leaderboard : {}", id);
        leaderboardRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("/leaderboards/search")
    public List<Leaderboard> search(String searchParameter) {
        List<Leaderboard> leaderboards = leaderboardRepository.findAll();
        List<Leaderboard> results = new ArrayList<>();

        for (int i = 0; i < leaderboards.size(); i++) {
            if (isSubset(leaderboards.get(i).getUser().getLogin().toLowerCase(), searchParameter.toLowerCase())) {
                results.add(leaderboards.get(i));
            }
        }

        return results;
    }

    private boolean isSubset(String temp1, String temp2) {
        if (temp1.length() < temp2.length()) return false;

        for (int i = 0; i < temp2.length(); i++) {
            if (temp1.charAt(i) != temp2.charAt(i)) return false;
        }

        return true;
    }
}
