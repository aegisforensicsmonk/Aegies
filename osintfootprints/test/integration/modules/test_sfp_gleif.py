import pytest
import unittest

from modules.sfp_gleif import sfp_gleif
from sflib import OsintFootprints
from osintfootprints import OsintFootprintsEvent, OsintFootprintsTarget


@pytest.mark.usefixtures
class TestModuleIntegrationGleif(unittest.TestCase):

    @unittest.skip("todo")
    def test_handleEvent(self):
        sf = OsintFootprints(self.default_options)

        module = sfp_gleif()
        module.setup(sf, dict())

        target_value = '7ZW8QJWVPR4P1J1KQY45'
        target_type = 'LEI'
        target = OsintFootprintsTarget(target_value, target_type)
        module.setTarget(target)

        event_type = 'ROOT'
        event_data = 'example data'
        event_module = ''
        source_event = ''
        evt = OsintFootprintsEvent(event_type, event_data, event_module, source_event)

        result = module.handleEvent(evt)

        self.assertIsNone(result)
