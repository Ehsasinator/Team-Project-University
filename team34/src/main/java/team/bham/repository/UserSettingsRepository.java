package team.bham.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import team.bham.domain.UserSettings;

/**
 * Spring Data JPA repository for the UserSettings entity.
 */
@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    default Optional<UserSettings> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<UserSettings> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<UserSettings> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select distinct userSettings from UserSettings userSettings left join fetch userSettings.user",
        countQuery = "select count(distinct userSettings) from UserSettings userSettings"
    )
    Page<UserSettings> findAllWithToOneRelationships(Pageable pageable);

    @Query("select distinct userSettings from UserSettings userSettings left join fetch userSettings.user")
    List<UserSettings> findAllWithToOneRelationships();

    @Query("select userSettings from UserSettings userSettings left join fetch userSettings.user where userSettings.id =:id")
    Optional<UserSettings> findOneWithToOneRelationships(@Param("id") Long id);
    /*@Query("select userSettings from UserSettings userSettings where userSettings.login =:login")
    Optional<UserSettings> findOneWithToOneRelationshipsUser(@Param("login") String login);*/
}
