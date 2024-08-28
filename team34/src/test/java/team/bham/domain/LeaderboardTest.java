package team.bham.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import team.bham.web.rest.TestUtil;

class LeaderboardTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Leaderboard.class);
        Leaderboard leaderboard1 = new Leaderboard();
        leaderboard1.setId(1L);
        Leaderboard leaderboard2 = new Leaderboard();
        leaderboard2.setId(leaderboard1.getId());
        assertThat(leaderboard1).isEqualTo(leaderboard2);
        leaderboard2.setId(2L);
        assertThat(leaderboard1).isNotEqualTo(leaderboard2);
        leaderboard1.setId(null);
        assertThat(leaderboard1).isNotEqualTo(leaderboard2);
    }
}
