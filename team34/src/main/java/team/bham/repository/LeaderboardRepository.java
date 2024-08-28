package team.bham.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import team.bham.domain.Leaderboard;

/**
 * Spring Data JPA repository for the Leaderboard entity.
 */
@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    default Optional<Leaderboard> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Leaderboard> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Leaderboard> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select distinct leaderboard from Leaderboard leaderboard left join fetch leaderboard.user",
        countQuery = "select count(distinct leaderboard) from Leaderboard leaderboard"
    )
    Page<Leaderboard> findAllWithToOneRelationships(Pageable pageable);

    @Query("select distinct leaderboard from Leaderboard leaderboard left join fetch leaderboard.user")
    List<Leaderboard> findAllWithToOneRelationships();

    @Query("select leaderboard from Leaderboard leaderboard left join fetch leaderboard.user where leaderboard.id =:id")
    Optional<Leaderboard> findOneWithToOneRelationships(@Param("id") Long id);
}
