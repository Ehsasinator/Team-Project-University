package team.bham.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import team.bham.IntegrationTest;
import team.bham.domain.Leaderboard;
import team.bham.repository.LeaderboardRepository;

/**
 * Integration tests for the {@link LeaderboardResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class LeaderboardResourceIT {

    private static final Integer DEFAULT_SCORE = 0;
    private static final Integer UPDATED_SCORE = 1;

    private static final Integer DEFAULT_RANK = 1;
    private static final Integer UPDATED_RANK = 2;

    private static final String ENTITY_API_URL = "/api/leaderboards";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private LeaderboardRepository leaderboardRepository;

    @Mock
    private LeaderboardRepository leaderboardRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restLeaderboardMockMvc;

    private Leaderboard leaderboard;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Leaderboard createEntity(EntityManager em) {
        Leaderboard leaderboard = new Leaderboard().score(DEFAULT_SCORE).rank(DEFAULT_RANK);
        return leaderboard;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Leaderboard createUpdatedEntity(EntityManager em) {
        Leaderboard leaderboard = new Leaderboard().score(UPDATED_SCORE).rank(UPDATED_RANK);
        return leaderboard;
    }

    @BeforeEach
    public void initTest() {
        leaderboard = createEntity(em);
    }

    @Test
    @Transactional
    void createLeaderboard() throws Exception {
        int databaseSizeBeforeCreate = leaderboardRepository.findAll().size();
        // Create the Leaderboard
        restLeaderboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(leaderboard)))
            .andExpect(status().isCreated());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeCreate + 1);
        Leaderboard testLeaderboard = leaderboardList.get(leaderboardList.size() - 1);
        assertThat(testLeaderboard.getScore()).isEqualTo(DEFAULT_SCORE);
        assertThat(testLeaderboard.getRank()).isEqualTo(DEFAULT_RANK);
    }

    @Test
    @Transactional
    void createLeaderboardWithExistingId() throws Exception {
        // Create the Leaderboard with an existing ID
        leaderboard.setId(1L);

        int databaseSizeBeforeCreate = leaderboardRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restLeaderboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(leaderboard)))
            .andExpect(status().isBadRequest());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllLeaderboards() throws Exception {
        // Initialize the database
        leaderboardRepository.saveAndFlush(leaderboard);

        // Get all the leaderboardList
        restLeaderboardMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(leaderboard.getId().intValue())))
            .andExpect(jsonPath("$.[*].score").value(hasItem(DEFAULT_SCORE)))
            .andExpect(jsonPath("$.[*].rank").value(hasItem(DEFAULT_RANK)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllLeaderboardsWithEagerRelationshipsIsEnabled() throws Exception {
        when(leaderboardRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restLeaderboardMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(leaderboardRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllLeaderboardsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(leaderboardRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restLeaderboardMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(leaderboardRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getLeaderboard() throws Exception {
        // Initialize the database
        leaderboardRepository.saveAndFlush(leaderboard);

        // Get the leaderboard
        restLeaderboardMockMvc
            .perform(get(ENTITY_API_URL_ID, leaderboard.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(leaderboard.getId().intValue()))
            .andExpect(jsonPath("$.score").value(DEFAULT_SCORE))
            .andExpect(jsonPath("$.rank").value(DEFAULT_RANK));
    }

    @Test
    @Transactional
    void getNonExistingLeaderboard() throws Exception {
        // Get the leaderboard
        restLeaderboardMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingLeaderboard() throws Exception {
        // Initialize the database
        leaderboardRepository.saveAndFlush(leaderboard);

        int databaseSizeBeforeUpdate = leaderboardRepository.findAll().size();

        // Update the leaderboard
        Leaderboard updatedLeaderboard = leaderboardRepository.findById(leaderboard.getId()).get();
        // Disconnect from session so that the updates on updatedLeaderboard are not directly saved in db
        em.detach(updatedLeaderboard);
        updatedLeaderboard.score(UPDATED_SCORE).rank(UPDATED_RANK);

        restLeaderboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedLeaderboard.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedLeaderboard))
            )
            .andExpect(status().isOk());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeUpdate);
        Leaderboard testLeaderboard = leaderboardList.get(leaderboardList.size() - 1);
        assertThat(testLeaderboard.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testLeaderboard.getRank()).isEqualTo(UPDATED_RANK);
    }

    @Test
    @Transactional
    void putNonExistingLeaderboard() throws Exception {
        int databaseSizeBeforeUpdate = leaderboardRepository.findAll().size();
        leaderboard.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaderboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, leaderboard.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(leaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchLeaderboard() throws Exception {
        int databaseSizeBeforeUpdate = leaderboardRepository.findAll().size();
        leaderboard.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaderboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(leaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamLeaderboard() throws Exception {
        int databaseSizeBeforeUpdate = leaderboardRepository.findAll().size();
        leaderboard.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaderboardMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(leaderboard)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateLeaderboardWithPatch() throws Exception {
        // Initialize the database
        leaderboardRepository.saveAndFlush(leaderboard);

        int databaseSizeBeforeUpdate = leaderboardRepository.findAll().size();

        // Update the leaderboard using partial update
        Leaderboard partialUpdatedLeaderboard = new Leaderboard();
        partialUpdatedLeaderboard.setId(leaderboard.getId());

        partialUpdatedLeaderboard.score(UPDATED_SCORE).rank(UPDATED_RANK);

        restLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeaderboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedLeaderboard))
            )
            .andExpect(status().isOk());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeUpdate);
        Leaderboard testLeaderboard = leaderboardList.get(leaderboardList.size() - 1);
        assertThat(testLeaderboard.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testLeaderboard.getRank()).isEqualTo(UPDATED_RANK);
    }

    @Test
    @Transactional
    void fullUpdateLeaderboardWithPatch() throws Exception {
        // Initialize the database
        leaderboardRepository.saveAndFlush(leaderboard);

        int databaseSizeBeforeUpdate = leaderboardRepository.findAll().size();

        // Update the leaderboard using partial update
        Leaderboard partialUpdatedLeaderboard = new Leaderboard();
        partialUpdatedLeaderboard.setId(leaderboard.getId());

        partialUpdatedLeaderboard.score(UPDATED_SCORE).rank(UPDATED_RANK);

        restLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeaderboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedLeaderboard))
            )
            .andExpect(status().isOk());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeUpdate);
        Leaderboard testLeaderboard = leaderboardList.get(leaderboardList.size() - 1);
        assertThat(testLeaderboard.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testLeaderboard.getRank()).isEqualTo(UPDATED_RANK);
    }

    @Test
    @Transactional
    void patchNonExistingLeaderboard() throws Exception {
        int databaseSizeBeforeUpdate = leaderboardRepository.findAll().size();
        leaderboard.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, leaderboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(leaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchLeaderboard() throws Exception {
        int databaseSizeBeforeUpdate = leaderboardRepository.findAll().size();
        leaderboard.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(leaderboard))
            )
            .andExpect(status().isBadRequest());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamLeaderboard() throws Exception {
        int databaseSizeBeforeUpdate = leaderboardRepository.findAll().size();
        leaderboard.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaderboardMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(leaderboard))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Leaderboard in the database
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteLeaderboard() throws Exception {
        // Initialize the database
        leaderboardRepository.saveAndFlush(leaderboard);

        int databaseSizeBeforeDelete = leaderboardRepository.findAll().size();

        // Delete the leaderboard
        restLeaderboardMockMvc
            .perform(delete(ENTITY_API_URL_ID, leaderboard.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Leaderboard> leaderboardList = leaderboardRepository.findAll();
        assertThat(leaderboardList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
