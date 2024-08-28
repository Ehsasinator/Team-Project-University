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
import team.bham.domain.UserSettings;
import team.bham.domain.enumeration.SIZE;
import team.bham.domain.enumeration.SIZE;
import team.bham.domain.enumeration.THEME;
import team.bham.repository.UserSettingsRepository;

/**
 * Integration tests for the {@link UserSettingsResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class UserSettingsResourceIT {

    private static final THEME DEFAULT_THEME = THEME.LIGHT;
    private static final THEME UPDATED_THEME = THEME.DARK;

    private static final SIZE DEFAULT_HUD = SIZE.SMALL;
    private static final SIZE UPDATED_HUD = SIZE.MEDIUM;

    private static final SIZE DEFAULT_FONT_SIZE = SIZE.SMALL;
    private static final SIZE UPDATED_FONT_SIZE = SIZE.MEDIUM;

    private static final Boolean DEFAULT_DYSLEXIC_FONT = false;
    private static final Boolean UPDATED_DYSLEXIC_FONT = true;

    private static final Boolean DEFAULT_COLOUR_BLINDNESS = false;
    private static final Boolean UPDATED_COLOUR_BLINDNESS = true;

    private static final String ENTITY_API_URL = "/api/user-settings";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Mock
    private UserSettingsRepository userSettingsRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUserSettingsMockMvc;

    private UserSettings userSettings;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserSettings createEntity(EntityManager em) {
        UserSettings userSettings = new UserSettings()
            .theme(DEFAULT_THEME)
            .hud(DEFAULT_HUD)
            .fontSize(DEFAULT_FONT_SIZE)
            .dyslexicFont(DEFAULT_DYSLEXIC_FONT)
            .colourBlindness(DEFAULT_COLOUR_BLINDNESS);
        return userSettings;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserSettings createUpdatedEntity(EntityManager em) {
        UserSettings userSettings = new UserSettings()
            .theme(UPDATED_THEME)
            .hud(UPDATED_HUD)
            .fontSize(UPDATED_FONT_SIZE)
            .dyslexicFont(UPDATED_DYSLEXIC_FONT)
            .colourBlindness(UPDATED_COLOUR_BLINDNESS);
        return userSettings;
    }

    @BeforeEach
    public void initTest() {
        userSettings = createEntity(em);
    }

    @Test
    @Transactional
    void createUserSettings() throws Exception {
        int databaseSizeBeforeCreate = userSettingsRepository.findAll().size();
        // Create the UserSettings
        restUserSettingsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(userSettings)))
            .andExpect(status().isCreated());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeCreate + 1);
        UserSettings testUserSettings = userSettingsList.get(userSettingsList.size() - 1);
        assertThat(testUserSettings.getTheme()).isEqualTo(DEFAULT_THEME);
        assertThat(testUserSettings.getHud()).isEqualTo(DEFAULT_HUD);
        assertThat(testUserSettings.getFontSize()).isEqualTo(DEFAULT_FONT_SIZE);
        assertThat(testUserSettings.getDyslexicFont()).isEqualTo(DEFAULT_DYSLEXIC_FONT);
        assertThat(testUserSettings.getColourBlindness()).isEqualTo(DEFAULT_COLOUR_BLINDNESS);
    }

    @Test
    @Transactional
    void createUserSettingsWithExistingId() throws Exception {
        // Create the UserSettings with an existing ID
        userSettings.setId(1L);

        int databaseSizeBeforeCreate = userSettingsRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restUserSettingsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(userSettings)))
            .andExpect(status().isBadRequest());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllUserSettings() throws Exception {
        // Initialize the database
        userSettingsRepository.saveAndFlush(userSettings);

        // Get all the userSettingsList
        restUserSettingsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(userSettings.getId().intValue())))
            .andExpect(jsonPath("$.[*].theme").value(hasItem(DEFAULT_THEME.toString())))
            .andExpect(jsonPath("$.[*].hud").value(hasItem(DEFAULT_HUD.toString())))
            .andExpect(jsonPath("$.[*].fontSize").value(hasItem(DEFAULT_FONT_SIZE.toString())))
            .andExpect(jsonPath("$.[*].dyslexicFont").value(hasItem(DEFAULT_DYSLEXIC_FONT.booleanValue())))
            .andExpect(jsonPath("$.[*].colourBlindness").value(hasItem(DEFAULT_COLOUR_BLINDNESS.booleanValue())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllUserSettingsWithEagerRelationshipsIsEnabled() throws Exception {
        when(userSettingsRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restUserSettingsMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(userSettingsRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllUserSettingsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(userSettingsRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restUserSettingsMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(userSettingsRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getUserSettings() throws Exception {
        // Initialize the database
        userSettingsRepository.saveAndFlush(userSettings);

        // Get the userSettings
        restUserSettingsMockMvc
            .perform(get(ENTITY_API_URL_ID, userSettings.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(userSettings.getId().intValue()))
            .andExpect(jsonPath("$.theme").value(DEFAULT_THEME.toString()))
            .andExpect(jsonPath("$.hud").value(DEFAULT_HUD.toString()))
            .andExpect(jsonPath("$.fontSize").value(DEFAULT_FONT_SIZE.toString()))
            .andExpect(jsonPath("$.dyslexicFont").value(DEFAULT_DYSLEXIC_FONT.booleanValue()))
            .andExpect(jsonPath("$.colourBlindness").value(DEFAULT_COLOUR_BLINDNESS.booleanValue()));
    }

    @Test
    @Transactional
    void getNonExistingUserSettings() throws Exception {
        // Get the userSettings
        restUserSettingsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingUserSettings() throws Exception {
        // Initialize the database
        userSettingsRepository.saveAndFlush(userSettings);

        int databaseSizeBeforeUpdate = userSettingsRepository.findAll().size();

        // Update the userSettings
        UserSettings updatedUserSettings = userSettingsRepository.findById(userSettings.getId()).get();
        // Disconnect from session so that the updates on updatedUserSettings are not directly saved in db
        em.detach(updatedUserSettings);
        updatedUserSettings
            .theme(UPDATED_THEME)
            .hud(UPDATED_HUD)
            .fontSize(UPDATED_FONT_SIZE)
            .dyslexicFont(UPDATED_DYSLEXIC_FONT)
            .colourBlindness(UPDATED_COLOUR_BLINDNESS);

        restUserSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedUserSettings.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedUserSettings))
            )
            .andExpect(status().isOk());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeUpdate);
        UserSettings testUserSettings = userSettingsList.get(userSettingsList.size() - 1);
        assertThat(testUserSettings.getTheme()).isEqualTo(UPDATED_THEME);
        assertThat(testUserSettings.getHud()).isEqualTo(UPDATED_HUD);
        assertThat(testUserSettings.getFontSize()).isEqualTo(UPDATED_FONT_SIZE);
        assertThat(testUserSettings.getDyslexicFont()).isEqualTo(UPDATED_DYSLEXIC_FONT);
        assertThat(testUserSettings.getColourBlindness()).isEqualTo(UPDATED_COLOUR_BLINDNESS);
    }

    @Test
    @Transactional
    void putNonExistingUserSettings() throws Exception {
        int databaseSizeBeforeUpdate = userSettingsRepository.findAll().size();
        userSettings.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, userSettings.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(userSettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchUserSettings() throws Exception {
        int databaseSizeBeforeUpdate = userSettingsRepository.findAll().size();
        userSettings.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(userSettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamUserSettings() throws Exception {
        int databaseSizeBeforeUpdate = userSettingsRepository.findAll().size();
        userSettings.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserSettingsMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(userSettings)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateUserSettingsWithPatch() throws Exception {
        // Initialize the database
        userSettingsRepository.saveAndFlush(userSettings);

        int databaseSizeBeforeUpdate = userSettingsRepository.findAll().size();

        // Update the userSettings using partial update
        UserSettings partialUpdatedUserSettings = new UserSettings();
        partialUpdatedUserSettings.setId(userSettings.getId());

        partialUpdatedUserSettings
            .fontSize(UPDATED_FONT_SIZE)
            .dyslexicFont(UPDATED_DYSLEXIC_FONT)
            .colourBlindness(UPDATED_COLOUR_BLINDNESS);

        restUserSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserSettings.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedUserSettings))
            )
            .andExpect(status().isOk());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeUpdate);
        UserSettings testUserSettings = userSettingsList.get(userSettingsList.size() - 1);
        assertThat(testUserSettings.getTheme()).isEqualTo(DEFAULT_THEME);
        assertThat(testUserSettings.getHud()).isEqualTo(DEFAULT_HUD);
        assertThat(testUserSettings.getFontSize()).isEqualTo(UPDATED_FONT_SIZE);
        assertThat(testUserSettings.getDyslexicFont()).isEqualTo(UPDATED_DYSLEXIC_FONT);
        assertThat(testUserSettings.getColourBlindness()).isEqualTo(UPDATED_COLOUR_BLINDNESS);
    }

    @Test
    @Transactional
    void fullUpdateUserSettingsWithPatch() throws Exception {
        // Initialize the database
        userSettingsRepository.saveAndFlush(userSettings);

        int databaseSizeBeforeUpdate = userSettingsRepository.findAll().size();

        // Update the userSettings using partial update
        UserSettings partialUpdatedUserSettings = new UserSettings();
        partialUpdatedUserSettings.setId(userSettings.getId());

        partialUpdatedUserSettings
            .theme(UPDATED_THEME)
            .hud(UPDATED_HUD)
            .fontSize(UPDATED_FONT_SIZE)
            .dyslexicFont(UPDATED_DYSLEXIC_FONT)
            .colourBlindness(UPDATED_COLOUR_BLINDNESS);

        restUserSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserSettings.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedUserSettings))
            )
            .andExpect(status().isOk());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeUpdate);
        UserSettings testUserSettings = userSettingsList.get(userSettingsList.size() - 1);
        assertThat(testUserSettings.getTheme()).isEqualTo(UPDATED_THEME);
        assertThat(testUserSettings.getHud()).isEqualTo(UPDATED_HUD);
        assertThat(testUserSettings.getFontSize()).isEqualTo(UPDATED_FONT_SIZE);
        assertThat(testUserSettings.getDyslexicFont()).isEqualTo(UPDATED_DYSLEXIC_FONT);
        assertThat(testUserSettings.getColourBlindness()).isEqualTo(UPDATED_COLOUR_BLINDNESS);
    }

    @Test
    @Transactional
    void patchNonExistingUserSettings() throws Exception {
        int databaseSizeBeforeUpdate = userSettingsRepository.findAll().size();
        userSettings.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, userSettings.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(userSettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchUserSettings() throws Exception {
        int databaseSizeBeforeUpdate = userSettingsRepository.findAll().size();
        userSettings.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(userSettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamUserSettings() throws Exception {
        int databaseSizeBeforeUpdate = userSettingsRepository.findAll().size();
        userSettings.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(userSettings))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserSettings in the database
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteUserSettings() throws Exception {
        // Initialize the database
        userSettingsRepository.saveAndFlush(userSettings);

        int databaseSizeBeforeDelete = userSettingsRepository.findAll().size();

        // Delete the userSettings
        restUserSettingsMockMvc
            .perform(delete(ENTITY_API_URL_ID, userSettings.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<UserSettings> userSettingsList = userSettingsRepository.findAll();
        assertThat(userSettingsList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
