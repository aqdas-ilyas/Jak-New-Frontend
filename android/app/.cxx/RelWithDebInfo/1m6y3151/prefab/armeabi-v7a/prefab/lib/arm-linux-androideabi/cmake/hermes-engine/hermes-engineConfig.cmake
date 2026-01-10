if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/aqdas/.gradle/caches/9.0.0/transforms/8b8ca282681f93672b4094299c7db947/transformed/jetified-hermes-android-0.82.1-release/prefab/modules/hermesvm/libs/android.armeabi-v7a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/aqdas/.gradle/caches/9.0.0/transforms/8b8ca282681f93672b4094299c7db947/transformed/jetified-hermes-android-0.82.1-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

