package team.bham.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import team.bham.domain.Competition;
import team.bham.domain.Entry;
import team.bham.domain.Leaderboard;
import team.bham.domain.Like;
import team.bham.repository.CompetitionRepository;
import team.bham.repository.EntryRepository;
import team.bham.repository.LeaderboardRepository;
import team.bham.repository.LikeRepository;
import team.bham.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link team.bham.domain.Competition}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class CompetitionResource {

    private final Logger log = LoggerFactory.getLogger(CompetitionResource.class);

    private static final String ENTITY_NAME = "competition";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CompetitionRepository competitionRepository;
    private final EntryRepository entryRepository;
    private final LikeRepository likeRepository;
    private final LeaderboardRepository leaderboardRepository;

    public CompetitionResource(
        CompetitionRepository competitionRepository,
        EntryRepository entryRepository,
        LikeRepository likeRepository,
        LeaderboardRepository leaderboardRepository
    ) {
        this.competitionRepository = competitionRepository;
        this.entryRepository = entryRepository;
        this.likeRepository = likeRepository;
        this.leaderboardRepository = leaderboardRepository;
    }

    /**
     * {@code POST  /competitions} : Create a new competition.
     *
     * @param competition the competition to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new competition, or with status {@code 400 (Bad Request)} if the competition has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/competitions")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Competition> createCompetition(@Valid @RequestBody Competition competition) throws URISyntaxException {
        log.debug("REST request to save Competition : {}", competition);
        if (competition.getId() != null) {
            throw new BadRequestAlertException("A new competition cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Competition result = competitionRepository.save(competition);
        return ResponseEntity
            .created(new URI("/api/competitions/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /competitions/:id} : Updates an existing competition.
     *
     * @param id the id of the competition to save.
     * @param competition the competition to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated competition,
     * or with status {@code 400 (Bad Request)} if the competition is not valid,
     * or with status {@code 500 (Internal Server Error)} if the competition couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/competitions/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Competition> updateCompetition(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Competition competition
    ) throws URISyntaxException {
        log.debug("REST request to update Competition : {}, {}", id, competition);
        if (competition.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, competition.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!competitionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Competition result = competitionRepository.save(competition);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, competition.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /competitions/:id} : Partial updates given fields of an existing competition, field will ignore if it is null
     *
     * @param id the id of the competition to save.
     * @param competition the competition to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated competition,
     * or with status {@code 400 (Bad Request)} if the competition is not valid,
     * or with status {@code 404 (Not Found)} if the competition is not found,
     * or with status {@code 500 (Internal Server Error)} if the competition couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/competitions/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Competition> partialUpdateCompetition(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Competition competition
    ) throws URISyntaxException {
        log.debug("REST request to partial update Competition partially : {}, {}", id, competition);
        if (competition.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, competition.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!competitionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Competition> result = competitionRepository
            .findById(competition.getId())
            .map(existingCompetition -> {
                if (competition.getDueDate() != null) {
                    existingCompetition.setDueDate(competition.getDueDate());
                }
                if (competition.getWord() != null) {
                    existingCompetition.setWord(competition.getWord());
                }
                if (competition.getOpen() != null) {
                    existingCompetition.setOpen(competition.getOpen());
                }

                return existingCompetition;
            })
            .map(competitionRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, competition.getId().toString())
        );
    }

    /**
     * {@code GET  /competitions} : get all the competitions.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of competitions in body.
     */
    @GetMapping("/competitions")
    public List<Competition> getAllCompetitions() {
        log.debug("REST request to get all Competitions");

        List<Competition> competitions = competitionRepository.findAll();

        for (int i = 0; i < competitions.size(); i++) {
            if (competitions.get(i).getOpen() && competitions.get(i).getDueDate().isBefore(Instant.now())) {
                competitions.get(i).setOpen(false);
                updateLeaderboard(competitions.get(i).getId());
            }
        }

        for (int i = 0; i < competitions.size(); i++) {
            if (competitions.get(i).getOpen()) {
                break;
            }

            if (i == competitions.size() - 1) {
                Competition newCompetition = new Competition();
                newCompetition.setId(null);
                newCompetition.setOpen(true);
                newCompetition.setWord(WordsAndPhrases.words.get(ThreadLocalRandom.current().nextInt(WordsAndPhrases.words.size())));
                newCompetition.setDueDate(Instant.now().plus(Duration.ofDays(1)));

                Competition result = competitionRepository.save(newCompetition);

                if (result != null) {
                    competitions.add(result);
                }
            }
        }

        return competitions;
    }

    /**
     * {@code GET  /competitions/:id} : get the "id" competition.
     *
     * @param id the id of the competition to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the competition, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/competitions/{id}")
    public ResponseEntity<Competition> getCompetition(@PathVariable Long id) {
        log.debug("REST request to get Competition : {}", id);
        Optional<Competition> competition = competitionRepository.findById(id);

        if (competition.isPresent() && competition.get().getOpen() && competition.get().getDueDate().isBefore(Instant.now())) {
            competition.get().setOpen(false);
            updateLeaderboard(competition.get().getId());
        }

        return ResponseUtil.wrapOrNotFound(competition);
    }

    /**
     * {@code DELETE  /competitions/:id} : delete the "id" competition.
     *
     * @param id the id of the competition to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/competitions/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCompetition(@PathVariable Long id) {
        log.debug("REST request to delete Competition : {}", id);

        List<Entry> entries = entryRepository.findByCompetitionId(id);

        if (entries != null && entries.size() > 0) {
            for (int i = 0; i < entries.size(); i++) {
                List<Like> likes = likeRepository.findByEntryId(entries.get(i).getId());

                if (likes != null && likes.size() > 0) {
                    for (int j = 0; j < likes.size(); j++) {
                        likeRepository.delete(likes.get(j));
                    }
                }

                entryRepository.delete(entries.get(i));
            }
        }

        competitionRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("competitions/randomWord")
    public ResponseEntity<String> getRandomWord() {
        int index = ThreadLocalRandom.current().nextInt(WordsAndPhrases.words.size()); // thread safe random number generator
        String word = WordsAndPhrases.words.get(index);
        return new ResponseEntity<>(word, HttpStatus.OK);
    }

    private void updateLeaderboard(Long competitionID) {
        List<Leaderboard> leaderboards = leaderboardRepository.findAll();
        List<Entry> entries = entryRepository.findByCompetitionId(competitionID);

        if (entries != null && entries.size() > 0) {
            outer:for (int i = 0; i < entries.size(); i++) {
                List<Like> likes = likeRepository.findByEntryId(entries.get(i).getId());

                for (int j = 0; j < leaderboards.size(); j++) {
                    if (leaderboards.get(j).getUser().equals(entries.get(i).getUser())) {
                        leaderboards.get(j).setScore(leaderboards.get(j).getScore() + likes.size() * 100);
                        continue outer;
                    }
                }

                Leaderboard newLeaderboard = new Leaderboard();
                newLeaderboard.setId(null);
                newLeaderboard.setRank(null);
                newLeaderboard.setScore(likes.size() * 100);
                newLeaderboard.setUser(entries.get(i).getUser());
                leaderboardRepository.save(newLeaderboard);
            }
        }
    }
}
